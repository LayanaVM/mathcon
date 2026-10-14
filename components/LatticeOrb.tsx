'use client';

import React, { useEffect, useRef } from 'react';
import type * as THREE_TYPES from 'three';

interface LatticeOrbProps {
  className?: string;
  enableInteraction?: boolean;
}

type ThreeInstance = typeof THREE_TYPES & { REVISION?: string };

function getWindowThree(): ThreeInstance | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { THREE?: ThreeInstance }).THREE;
}

// Dynamically ensure Three.js r128 from CDNJS is loaded and ready
function loadThreeR128(): Promise<ThreeInstance> {
  if (typeof window === 'undefined') return Promise.reject();
  const globalThree = getWindowThree();
  if (globalThree) {
    return Promise.resolve(globalThree);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="three.js/r128"]') as HTMLScriptElement | null;
    if (existing) {
      const gThree = getWindowThree();
      if (gThree) {
        resolve(gThree);
        return;
      }
      existing.addEventListener('load', () => {
        const t = getWindowThree();
        if (t) resolve(t);
      });
      existing.addEventListener('error', async () => {
        const bundled = await import('three');
        resolve(bundled as unknown as ThreeInstance);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      const t = getWindowThree();
      if (t) resolve(t);
    };
    script.onerror = async () => {
      // Offline / fallback to local package if network is unavailable
      const bundled = await import('three');
      resolve(bundled as unknown as ThreeInstance);
    };
    document.head.appendChild(script);
  });
}

const LatticeOrb: React.FC<LatticeOrbProps> = ({ className = '', enableInteraction = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isCancelled = false;
    let cleanupFn: (() => void) | null = null;

    loadThreeR128().then((THREE) => {
      if (isCancelled) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // ---------- Mobile Performance Profile ----------
      const isMobile =
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(pointer: coarse)').matches) ||
        Math.min(window.innerWidth, window.innerHeight) < 768;

      // Cap pixel ratio at 1.25 on mobile, 2.0 on desktop
      const dprMax = isMobile ? 1.25 : 2.0;
      const dprFloor = 0.75;
      let dpr = Math.min(window.devicePixelRatio || 1, dprMax);

      // 30 fps limit on mobile
      const frameMsLimit = isMobile ? 1000 / 30 : 0;

      // Scaled entity counts
      const CUBE_COUNT = isMobile ? 12 : 24;
      const DUST_COUNT = isMobile ? 45 : 140;
      const HASH_LABEL_COUNT = isMobile ? 2 : 5;

      // Palette: Pure Black background (#000000), Emerald (#3ddc84), Mint Green (#a7f3d0) - Green throughout
      const BG_COLOR_HEX = 0x000000;
      const EMERALD_HEX = 0x3ddc84;
      const MINT_HEX = 0xa7f3d0;
      const EMERALD = new THREE.Color(EMERALD_HEX);
      const CREAM = new THREE.Color(MINT_HEX);

      let rawRenderer: THREE_TYPES.WebGLRenderer | undefined;
      try {
        rawRenderer = new THREE.WebGLRenderer({
          canvas,
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'default',
          stencil: false,
          precision: 'mediump'
        });
      } catch (err) {
        console.error('[LatticeOrb] THREE.WebGLRenderer failed:', err);
        return;
      }
      if (!rawRenderer) return;
      const renderer = rawRenderer;

      const gl = renderer.getContext();
      if (gl && typeof gl.getShaderPrecisionFormat === 'function') {
        const origGetShaderPrecisionFormat = gl.getShaderPrecisionFormat.bind(gl);
        gl.getShaderPrecisionFormat = (shaderType: number, precisionType: number) => {
          try {
            const res = origGetShaderPrecisionFormat(shaderType, precisionType);
            if (res && typeof res.precision === 'number') return res;
          } catch {}
          return { rangeMin: 1, rangeMax: 1, precision: 23 };
        };
      }

      renderer.setPixelRatio(dpr);
      renderer.setClearColor(BG_COLOR_HEX, 1.0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 8);

      const disposables: { dispose: () => void }[] = [];
      const registerDisposable = <T extends { dispose: () => void }>(d: T): T => {
        disposables.push(d);
        return d;
      };

      function noDepth<T extends THREE_TYPES.Material>(mat: T): T {
        mat.depthWrite = false;
        mat.depthTest = false;
        mat.blending = THREE.NormalBlending;
        mat.transparent = true;
        return mat;
      }

      // Crisp solid dot vertex texture (strictly NO glow, NO bloom, NO soft radial blur)
      function makeCrispDotTexture() {
        const c = document.createElement('canvas');
        c.width = 48;
        c.height = 48;
        const g = c.getContext('2d');
        if (g) {
          g.clearRect(0, 0, 48, 48);
          g.fillStyle = '#ffffff';
          g.beginPath();
          g.arc(24, 24, 21, 0, Math.PI * 2);
          g.fill();
        }
        const tex = registerDisposable(new THREE.CanvasTexture(c));
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        return tex;
      }
      const crispDotTex = makeCrispDotTexture();

      // Monospace label creator (JetBrains Mono / monospace, crisp text with no glow)
      function makeLabel(text: string, hexColor: string, heightWorld: number, opacity: number = 0.9) {
        const fontPx = 36;
        const font = `600 ${fontPx}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
        const c = document.createElement('canvas');
        const g = c.getContext('2d');
        let w = 240;
        const h = fontPx + 20;
        if (g) {
          g.font = font;
          w = Math.ceil(g.measureText(text).width) + 24;
          c.width = w;
          c.height = h;
          g.font = font;
          g.textBaseline = 'middle';
          g.fillStyle = hexColor;
          g.fillText(text, 12, h / 2 + 1);
        } else {
          c.width = w;
          c.height = h;
        }
        const tex = registerDisposable(new THREE.CanvasTexture(c));
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        const mat = registerDisposable(
          noDepth(new THREE.SpriteMaterial({ map: tex, opacity }))
        );
        const sp = new THREE.Sprite(mat);
        sp.scale.set((heightWorld * w) / h, heightWorld, 1);
        return sp;
      }

      // Helper to generate jittered icosahedron geometry with unique vertices and edges
      function createJitteredIcosahedron(radius: number, detail: number, jitter: number) {
        const base = registerDisposable(new THREE.IcosahedronGeometry(1, detail));
        const pos = base.attributes.position;
        const count = pos.count;

        const vertexMap = new Map<string, number>();
        const uniqueVerts: { x: number; y: number; z: number }[] = [];
        const indexLookup: number[] = [];

        for (let i = 0; i < count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
          let idx = vertexMap.get(key);
          if (idx === undefined) {
            const jx = x + (Math.random() - 0.5) * jitter;
            const jy = y + (Math.random() - 0.5) * jitter;
            const jz = z + (Math.random() - 0.5) * jitter;
            const len = Math.sqrt(jx * jx + jy * jy + jz * jz) || 1;
            const vx = (jx / len) * radius;
            const vy = (jy / len) * radius;
            const vz = (jz / len) * radius;
            idx = uniqueVerts.length;
            uniqueVerts.push({ x: vx, y: vy, z: vz });
            vertexMap.set(key, idx);
          }
          indexLookup.push(idx);
        }

        const edgeSet = new Set<string>();
        const edges: [number, number][] = [];
        for (let i = 0; i < count; i += 3) {
          const a = indexLookup[i];
          const b = indexLookup[i + 1];
          const c = indexLookup[i + 2];
          const addEdge = (u: number, v: number) => {
            const min = Math.min(u, v);
            const max = Math.max(u, v);
            const k = `${min}_${max}`;
            if (!edgeSet.has(k)) {
              edgeSet.add(k);
              edges.push([min, max]);
            }
          };
          addEdge(a, b);
          addEdge(b, c);
          addEdge(c, a);
        }

        return { uniqueVerts, edges };
      }

      // Factory to construct a complete wireframe geodesic sphere with 3 nested shells, spokes & rings
      function createGeodesicRig(scaleMult: number = 1.0, rotOffsetY: number = 0) {
        const rig = new THREE.Group();

        // Shell 1: Outer Geodesic Shell (Emerald wireframe + cream dot vertices)
        const outerData = createJitteredIcosahedron(1.75 * scaleMult, 2, 0.12 * scaleMult);
        const outerGroup = new THREE.Group();
        {
          const lineArr = new Float32Array(outerData.edges.length * 6);
          for (let e = 0; e < outerData.edges.length; e++) {
            const [u, v] = outerData.edges[e];
            const vu = outerData.uniqueVerts[u];
            const vv = outerData.uniqueVerts[v];
            lineArr[e * 6] = vu.x;
            lineArr[e * 6 + 1] = vu.y;
            lineArr[e * 6 + 2] = vu.z;
            lineArr[e * 6 + 3] = vv.x;
            lineArr[e * 6 + 4] = vv.y;
            lineArr[e * 6 + 5] = vv.z;
          }
          const lineGeo = registerDisposable(new THREE.BufferGeometry());
          lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
          const lineMat = registerDisposable(
            noDepth(new THREE.LineBasicMaterial({ color: EMERALD, opacity: 0.8 }))
          );
          outerGroup.add(new THREE.LineSegments(lineGeo, lineMat));

          const ptArr = new Float32Array(outerData.uniqueVerts.length * 3);
          outerData.uniqueVerts.forEach((v, i) => {
            ptArr[i * 3] = v.x;
            ptArr[i * 3 + 1] = v.y;
            ptArr[i * 3 + 2] = v.z;
          });
          const ptGeo = registerDisposable(new THREE.BufferGeometry());
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptArr, 3));
          const ptMat = registerDisposable(
            noDepth(
              new THREE.PointsMaterial({
                color: CREAM,
                size: 0.09 * scaleMult,
                map: crispDotTex,
                sizeAttenuation: true
              })
            )
          );
          outerGroup.add(new THREE.Points(ptGeo, ptMat));
        }
        rig.add(outerGroup);

        // Shell 2: Middle Geodesic Shell (Cream wireframe - SCATTERS EVERY 10 SECONDS)
        const midData = createJitteredIcosahedron(1.42 * scaleMult, isMobile ? 1 : 2, 0.14 * scaleMult);
        const midGroup = new THREE.Group();
        const midOrigVerts = new Float32Array(midData.uniqueVerts.length * 3);
        const midScatterDirs = new Float32Array(midData.uniqueVerts.length * 3);
        const midPtPos = new Float32Array(midData.uniqueVerts.length * 3);

        for (let i = 0; i < midData.uniqueVerts.length; i++) {
          const v = midData.uniqueVerts[i];
          midOrigVerts[i * 3] = v.x;
          midOrigVerts[i * 3 + 1] = v.y;
          midOrigVerts[i * 3 + 2] = v.z;
          midPtPos[i * 3] = v.x;
          midPtPos[i * 3 + 1] = v.y;
          midPtPos[i * 3 + 2] = v.z;

          const dir = new THREE.Vector3(
            v.x + (Math.random() - 0.5) * 1.6,
            v.y + (Math.random() - 0.5) * 1.6,
            v.z + (Math.random() - 0.5) * 1.6
          ).normalize();
          midScatterDirs[i * 3] = dir.x;
          midScatterDirs[i * 3 + 1] = dir.y;
          midScatterDirs[i * 3 + 2] = dir.z;
        }

        const midPtGeo = registerDisposable(new THREE.BufferGeometry());
        midPtGeo.setAttribute('position', new THREE.BufferAttribute(midPtPos, 3).setUsage(THREE.DynamicDrawUsage));
        const midPtMat = registerDisposable(
          noDepth(
            new THREE.PointsMaterial({
              color: EMERALD,
              size: 0.08 * scaleMult,
              map: crispDotTex,
              sizeAttenuation: true
            })
          )
        );
        midGroup.add(new THREE.Points(midPtGeo, midPtMat));

        const midLinePos = new Float32Array(midData.edges.length * 6);
        for (let e = 0; e < midData.edges.length; e++) {
          const [u, v] = midData.edges[e];
          midLinePos[e * 6] = midOrigVerts[u * 3];
          midLinePos[e * 6 + 1] = midOrigVerts[u * 3 + 1];
          midLinePos[e * 6 + 2] = midOrigVerts[u * 3 + 2];
          midLinePos[e * 6 + 3] = midOrigVerts[v * 3];
          midLinePos[e * 6 + 4] = midOrigVerts[v * 3 + 1];
          midLinePos[e * 6 + 5] = midOrigVerts[v * 3 + 2];
        }
        const midLineGeo = registerDisposable(new THREE.BufferGeometry());
        midLineGeo.setAttribute('position', new THREE.BufferAttribute(midLinePos, 3).setUsage(THREE.DynamicDrawUsage));
        const midLineMat = registerDisposable(
          noDepth(new THREE.LineBasicMaterial({ color: CREAM, opacity: 0.75 }))
        );
        midGroup.add(new THREE.LineSegments(midLineGeo, midLineMat));
        rig.add(midGroup);

        // Shell 3: Inner Geodesic Shell (Emerald wireframe + crisp dots)
        const innerData = createJitteredIcosahedron(1.1 * scaleMult, 1, 0.1 * scaleMult);
        const innerGroup = new THREE.Group();
        {
          const lineArr = new Float32Array(innerData.edges.length * 6);
          for (let e = 0; e < innerData.edges.length; e++) {
            const [u, v] = innerData.edges[e];
            const vu = innerData.uniqueVerts[u];
            const vv = innerData.uniqueVerts[v];
            lineArr[e * 6] = vu.x;
            lineArr[e * 6 + 1] = vu.y;
            lineArr[e * 6 + 2] = vu.z;
            lineArr[e * 6 + 3] = vv.x;
            lineArr[e * 6 + 4] = vv.y;
            lineArr[e * 6 + 5] = vv.z;
          }
          const lineGeo = registerDisposable(new THREE.BufferGeometry());
          lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
          const lineMat = registerDisposable(
            noDepth(new THREE.LineBasicMaterial({ color: EMERALD, opacity: 0.65 }))
          );
          innerGroup.add(new THREE.LineSegments(lineGeo, lineMat));

          const ptArr = new Float32Array(innerData.uniqueVerts.length * 3);
          innerData.uniqueVerts.forEach((v, i) => {
            ptArr[i * 3] = v.x;
            ptArr[i * 3 + 1] = v.y;
            ptArr[i * 3 + 2] = v.z;
          });
          const ptGeo = registerDisposable(new THREE.BufferGeometry());
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptArr, 3));
          const ptMat = registerDisposable(
            noDepth(
              new THREE.PointsMaterial({
                color: CREAM,
                size: 0.07 * scaleMult,
                map: crispDotTex,
                sizeAttenuation: true
              })
            )
          );
          innerGroup.add(new THREE.Points(ptGeo, ptMat));
        }
        rig.add(innerGroup);

        // Radial Spokes connecting outer and inner shells
        {
          const spokeArr: number[] = [];
          const step = isMobile ? 4 : 2;
          for (let i = 0; i < outerData.uniqueVerts.length; i += step) {
            const v = outerData.uniqueVerts[i];
            const a = new THREE.Vector3(v.x, v.y, v.z).multiplyScalar((1.1 * scaleMult) / (1.75 * scaleMult));
            spokeArr.push(v.x * 0.85, v.y * 0.85, v.z * 0.85, a.x, a.y, a.z);
          }
          const spokeGeo = registerDisposable(new THREE.BufferGeometry());
          spokeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(spokeArr), 3));
          const spokeMat = registerDisposable(
            noDepth(new THREE.LineBasicMaterial({ color: CREAM, opacity: 0.28 }))
          );
          rig.add(new THREE.LineSegments(spokeGeo, spokeMat));
        }

        // Two Thin Rings
        const ringSeg = isMobile ? 48 : 80;
        const ring1Geo = registerDisposable(new THREE.TorusGeometry(1.62 * scaleMult, 0.01 * scaleMult, 6, ringSeg));
        const ring1Mat = registerDisposable(noDepth(new THREE.MeshBasicMaterial({ color: CREAM, opacity: 0.6 })));
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        ring1.rotation.x = Math.PI / 2 + 0.3;
        ring1.rotation.y = 0.2 + rotOffsetY;
        rig.add(ring1);

        const ring2Geo = registerDisposable(new THREE.TorusGeometry(1.54 * scaleMult, 0.01 * scaleMult, 6, ringSeg));
        const ring2Mat = registerDisposable(noDepth(new THREE.MeshBasicMaterial({ color: EMERALD, opacity: 0.6 })));
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.x = Math.PI / 2 - 0.25;
        ring2.rotation.y = -0.35 + rotOffsetY;
        rig.add(ring2);

        rig.rotation.y = rotOffsetY;

        return {
          rig,
          outerGroup,
          midGroup,
          innerGroup,
          ring1,
          ring2,
          midData,
          midOrigVerts,
          midScatterDirs,
          midPtPos,
          midPtGeo,
          midLinePos,
          midLineGeo,
          midLineMat,
          rotOffsetY
        };
      }

      // Two Geodesic Orbs:
      // Desktop: Orb 1 at Top-Left, Orb 2 at Bottom-Right
      // Mobile: Orb 1 hidden, Orb 2 at Bottom (peeking as half-hemisphere below heading)
      const orb1 = createGeodesicRig(1.0, 0.0);
      const orb2 = createGeodesicRig(1.0, 1.2);
      scene.add(orb1.rig);
      scene.add(orb2.rig);

      // Floating Wireframe Cubes (Orbit, bob, tumble, and repel away from pointer/finger)
      interface CubeData {
        radius: number;
        theta: number;
        phi: number;
        orbit: number;
        bobAmp: number;
        bobSpeed: number;
        bobPhase: number;
        spin: THREE_TYPES.Vector3;
        baseScale: number;
        off: THREE_TYPES.Vector3;
        offTarget: THREE_TYPES.Vector3;
      }

      const cubes: THREE_TYPES.Group[] = [];
      const boxGeo = registerDisposable(new THREE.BoxGeometry(1, 1, 1));
      const boxEdges = registerDisposable(new THREE.EdgesGeometry(boxGeo));
      const cubeEdgeMats = [
        registerDisposable(noDepth(new THREE.LineBasicMaterial({ color: EMERALD, opacity: 0.9 }))),
        registerDisposable(noDepth(new THREE.LineBasicMaterial({ color: CREAM, opacity: 0.9 })))
      ];

      for (let c = 0; c < CUBE_COUNT; c++) {
        const which = c % 2;
        const cube = new THREE.Group();
        cube.add(new THREE.LineSegments(boxEdges, cubeEdgeMats[which]));
        // On mobile, skip cube faces entirely (pure wireframe).
        // On desktop, keep pure wireframe for crisp, clean aesthetics.
        const s = 0.16 + Math.random() * 0.32;
        cube.scale.setScalar(s);

        const uData: CubeData = {
          radius: 2.5 + Math.random() * 2.2,
          theta: Math.random() * Math.PI * 2,
          phi: Math.acos(2 * Math.random() - 1),
          orbit: (0.04 + Math.random() * 0.09) * (Math.random() < 0.5 ? -1 : 1),
          bobAmp: 0.12 + Math.random() * 0.24,
          bobSpeed: 0.5 + Math.random() * 0.8,
          bobPhase: Math.random() * 6.28,
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 0.85,
            (Math.random() - 0.5) * 0.85,
            (Math.random() - 0.5) * 0.85
          ),
          baseScale: s,
          off: new THREE.Vector3(),
          offTarget: new THREE.Vector3()
        };
        cube.userData = uData;
        cube.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        scene.add(cube);
        cubes.push(cube);
      }

      // Small Monospace Hash Labels riding on floating cubes
      const hashTexts = [
        '0x9f3a·c1b7',
        '0x4e0d·7a52',
        '0xb71c·e9f0',
        '0x2a8d·05c4',
        '0xd3f6·88a1',
        '0x61be·3d97'
      ];
      const hashLabels: { sp: THREE_TYPES.Sprite; cube: THREE_TYPES.Group }[] = [];
      for (let h = 0; h < HASH_LABEL_COUNT; h++) {
        const hl = makeLabel(
          hashTexts[h % hashTexts.length],
          h % 2 === 0 ? '#a7f3d0' : '#3ddc84',
          isMobile ? 0.16 : 0.14,
          0.75
        );
        scene.add(hl);
        hashLabels.push({ sp: hl, cube: cubes[h * 2] });
      }

      // Small Monospace Maths & Cryptography Text Labels floating in scene
      const mathLabelDefs = isMobile
        ? [
            { t: 'A·s + e mod q', c: '#a7f3d0', anchor: [-0.35, 0.82] },
            { t: 'SVP', c: '#3ddc84', anchor: [0.42, 0.72] },
            { t: 'λ₁(L)', c: '#a7f3d0', anchor: [0.55, -0.65] }
          ]
        : [
            { t: 'A·s + e mod q', c: '#a7f3d0', anchor: [-0.56, 0.78] },
            { t: 'SVP', c: '#3ddc84', anchor: [0.58, 0.74] },
            { t: 'λ₁(L)', c: '#a7f3d0', anchor: [-0.68, 0.34] },
            { t: 'LWE(n, q, χ)', c: '#3ddc84', anchor: [0.68, 0.12] },
            { t: 'b₁*, ..., b_n*', c: '#a7f3d0', anchor: [0.58, -0.58] },
            { t: '0x9f3a·c1b7', c: '#3ddc84', anchor: [0.18, -0.82] }
          ];

      const mathLabels = mathLabelDefs.map((def, idx) => {
        const sp = makeLabel(def.t, def.c, isMobile ? 0.24 : 0.2, 0.85);
        scene.add(sp);
        return { sp, anchor: def.anchor, phase: idx * 1.8, base: new THREE.Vector3() };
      });

      // Scatter status indicator label (subtle monospace notification during middle shell scatter)
      const scatterLabel = makeLabel('Scatter: A·s + e mod q', '#3ddc84', isMobile ? 0.22 : 0.2, 0);
      scene.add(scatterLabel);

      // Small 3D Lattice with b₁, b₂, b₃ basis vectors in the bottom corner
      const cornerLattice = new THREE.Group();
      scene.add(cornerLattice);
      (() => {
        const N = isMobile ? 1 : 2;
        const ls = isMobile ? 0.42 : 0.32;
        const B = [
          new THREE.Vector3(1.0, 0.14, 0.05),
          new THREE.Vector3(0.28, 1.0, 0.12),
          new THREE.Vector3(0.08, 0.25, 1.0)
        ];
        const latPts: number[] = [];
        for (let i = -N; i <= N; i++) {
          for (let j = -N; j <= N; j++) {
            for (let k = -N; k <= N; k++) {
              const p = new THREE.Vector3()
                .addScaledVector(B[0], i)
                .addScaledVector(B[1], j)
                .addScaledVector(B[2], k)
                .multiplyScalar(ls);
              latPts.push(p.x, p.y, p.z);
            }
          }
        }
        const latGeo = registerDisposable(new THREE.BufferGeometry());
        latGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(latPts), 3));
        const latMat = registerDisposable(
          noDepth(
            new THREE.PointsMaterial({
              color: EMERALD,
              size: 0.065,
              map: crispDotTex,
              sizeAttenuation: true,
              opacity: 0.85
            })
          )
        );
        cornerLattice.add(new THREE.Points(latGeo, latMat));

        // Basis vectors b1, b2, b3 lines with labels at tips
        const vectorColors = [CREAM, EMERALD, CREAM];
        const vectorLabels = ['b₁', 'b₂', 'b₃'];
        const tipPoints: number[] = [];
        const mult = isMobile ? 1.1 : 1.4;

        for (let b = 0; b < 3; b++) {
          const tip = B[b].clone().multiplyScalar(ls * mult);
          const vGeo = registerDisposable(new THREE.BufferGeometry());
          vGeo.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array([0, 0, 0, tip.x, tip.y, tip.z]), 3)
          );
          const vMat = registerDisposable(
            noDepth(new THREE.LineBasicMaterial({ color: vectorColors[b], opacity: 0.95 }))
          );
          cornerLattice.add(new THREE.Line(vGeo, vMat));
          tipPoints.push(tip.x, tip.y, tip.z);

          const lab = makeLabel(vectorLabels[b], b === 1 ? '#3ddc84' : '#a7f3d0', 0.16, 0.95);
          lab.position.copy(tip).add(B[b].clone().normalize().multiplyScalar(0.18));
          cornerLattice.add(lab);
        }

        const tipGeo = registerDisposable(new THREE.BufferGeometry());
        tipGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tipPoints), 3));
        const tipMat = registerDisposable(
          noDepth(
            new THREE.PointsMaterial({
              color: CREAM,
              size: 0.11,
              map: crispDotTex,
              sizeAttenuation: true
            })
          )
        );
        cornerLattice.add(new THREE.Points(tipGeo, tipMat));
      })();
      cornerLattice.rotation.x = 0.45;
      cornerLattice.scale.setScalar(isMobile ? 0.95 : 1.1);

      // Lines with Moving Light Dots Between Nearby Cubes
      const MAX_LINKS = isMobile ? 24 : 50;
      const linkPos = new Float32Array(MAX_LINKS * 6);
      const linkGeo = registerDisposable(new THREE.BufferGeometry());
      linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3).setUsage(THREE.DynamicDrawUsage));
      linkGeo.setDrawRange(0, 0);
      const linkMat = registerDisposable(
        noDepth(new THREE.LineBasicMaterial({ color: EMERALD, opacity: 0.32 }))
      );
      const linkLines = new THREE.LineSegments(linkGeo, linkMat);
      linkLines.frustumCulled = false;
      scene.add(linkLines);

      const MAX_PULSES = isMobile ? 6 : 14;
      const pulsePos = new Float32Array(MAX_PULSES * 3);
      const pulseGeo = registerDisposable(new THREE.BufferGeometry());
      pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3).setUsage(THREE.DynamicDrawUsage));
      pulseGeo.setDrawRange(0, 0);
      const pulseMat = registerDisposable(
        noDepth(
          new THREE.PointsMaterial({
            color: CREAM,
            size: 0.14,
            map: crispDotTex,
            sizeAttenuation: true
          })
        )
      );
      const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
      pulsePoints.frustumCulled = false;
      scene.add(pulsePoints);

      const linkDistanceThresholdSq = isMobile ? 3.4 * 3.4 : 3.0 * 3.0;

      // Drifting Subtle Dust Particles
      const dustPos = new Float32Array(DUST_COUNT * 3);
      for (let d = 0; d < DUST_COUNT; d++) {
        dustPos[d * 3] = (Math.random() - 0.5) * 16;
        dustPos[d * 3 + 1] = (Math.random() - 0.5) * 10;
        dustPos[d * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
      }
      const dustGeo = registerDisposable(new THREE.BufferGeometry());
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = registerDisposable(
        noDepth(
          new THREE.PointsMaterial({
            color: CREAM,
            size: 0.05,
            map: crispDotTex,
            opacity: 0.45
          })
        )
      );
      const dustMesh = new THREE.Points(dustGeo, dustMat);
      scene.add(dustMesh);

      // Resizing and Viewport Anchors
      let aspect = 1;
      function handleResize() {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        aspect = w / h;
        camera.aspect = aspect;
        camera.position.z = aspect < 1 ? 8 + (1 - aspect) * 6.5 : 8;
        camera.updateProjectionMatrix();

        const halfH = Math.tan((22.5 * Math.PI) / 180) * camera.position.z;
        const halfW = halfH * aspect;

        const isMobileLayout = w < 768;

        if (isMobileLayout) {
          // Mobile view:
          // Only ONE globe, placed strictly BELOW the main heading and CTAs!
          // Positioned at bottom center so it is shown as half hemisphere peeking up from bottom.
          // It DOES NOT come under the heading text at all.
          orb1.rig.visible = false;
          orb2.rig.visible = true;
          orb2.rig.position.set(0, -halfH * 1.16, 0);
          orb2.rig.scale.setScalar(0.96);

          scatterLabel.position.set(0, -halfH * 0.42, 0.5);
          cornerLattice.position.set(-halfW * 0.72, -halfH * 0.75, -0.3);
        } else {
          // Desktop view:
          // TWO smaller globes:
          // One in the top-left corner, one in the bottom-right corner.
          // Center is completely clear for the main heading text.
          orb1.rig.visible = true;
          orb2.rig.visible = true;

          // Orb 1: Top-Left
          orb1.rig.position.set(-halfW * 0.76, halfH * 0.52, 0);
          orb1.rig.scale.setScalar(0.58);

          // Orb 2: Bottom-Right
          orb2.rig.position.set(halfW * 0.76, -halfH * 0.52, 0);
          orb2.rig.scale.setScalar(0.58);

          scatterLabel.position.set(0, -halfH * 0.78, 0.5);
          cornerLattice.position.set(-halfW * 0.72, -halfH * 0.65, -0.3);
        }

        mathLabels.forEach((ml) => {
          ml.base.set(ml.anchor[0] * halfW, ml.anchor[1] * halfH, 0);
        });
      }

      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);
      handleResize();

      let isVisible = true;
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]) {
            isVisible = entries[0].isIntersecting;
          }
        },
        { threshold: 0.01 }
      );
      intersectionObserver.observe(container);

      // Pointer & Touch Repulsion (Targeted only at floating cubes - Sphere itself must NOT react)
      const ptr = { x: 0, y: 0, active: false };
      const updatePointerCoords = (clientX: number, clientY: number) => {
        if (!enableInteraction) return;
        const heroElem = document.getElementById('hero') || container;
        if (!heroElem) return;
        const r = heroElem.getBoundingClientRect();
        if (
          clientX >= r.left &&
          clientX <= r.right &&
          clientY >= r.top &&
          clientY <= r.bottom
        ) {
          ptr.x = ((clientX - r.left) / r.width) * 2 - 1;
          ptr.y = -(((clientY - r.top) / r.height) * 2 - 1);
          ptr.active = true;
        } else {
          ptr.active = false;
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        updatePointerCoords(e.clientX, e.clientY);
      };

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updatePointerCoords(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const onPointerDeactivate = () => {
        ptr.active = false;
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('pointerup', onPointerDeactivate, { passive: true });
      window.addEventListener('touchend', onPointerDeactivate, { passive: true });
      window.addEventListener('pointerleave', onPointerDeactivate, { passive: true });

      // Animation Loop Variables
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const speedMultiplier = reduceMotion ? 0.3 : 1.0;

      let animId = 0;
      let lastTime = performance.now();
      let elapsed = 0;

      // Dynamic Resolution Throttling for Slow Frames
      let frameTimesSum = 0;
      let frameCount = 0;
      let consecutiveSlowPeriods = 0;
      const slowThresholdMs = isMobile ? 42 : 28;

      // 10-Second Scatter Animation State for Middle Shell
      const SCATTER_CYCLE = 10.0;
      const SCATTER_DURATION = 2.4;
      let isScattering = false;

      const tmpVec = new THREE.Vector3();
      const projVec = new THREE.Vector3();
      const REPEL_RADIUS = 0.54;

      function renderFrame(now: number) {
        animId = requestAnimationFrame(renderFrame);

        if (!isVisible) {
          lastTime = now;
          return;
        }

        const delta = now - lastTime;

        // Cap frame rate on mobile at 30 fps
        if (frameMsLimit && delta < frameMsLimit - 2) return;
        lastTime = now;

        const dt = Math.min(delta / 1000, 0.05) * speedMultiplier;
        elapsed += dt;
        const t = elapsed;

        // Dynamic resolution monitor
        frameTimesSum += delta;
        frameCount++;
        if (frameCount >= 60) {
          const avgFrameTime = frameTimesSum / frameCount;
          frameTimesSum = 0;
          frameCount = 0;
          if (avgFrameTime > slowThresholdMs) {
            consecutiveSlowPeriods++;
            if (consecutiveSlowPeriods >= 2 && dpr > dprFloor) {
              dpr = Math.max(dprFloor, dpr - 0.25);
              renderer.setPixelRatio(dpr);
              if (container) renderer.setSize(container.clientWidth, container.clientHeight, false);
              consecutiveSlowPeriods = 0;
            }
          } else {
            consecutiveSlowPeriods = 0;
          }
        }

        // ==========================================
        // 1. Geodesic Sphere Rotations (orb1 & orb2)
        // (SPHERES MUST NOT REACT TO POINTER)
        // ==========================================
        const orbs = [orb1, orb2];
        orbs.forEach((orb, oIdx) => {
          if (!orb.rig.visible) return;
          const sign = oIdx === 0 ? 1 : -1;
          orb.rig.rotation.y += dt * 0.11 * sign;
          orb.rig.rotation.x = Math.sin(t * 0.28 + orb.rotOffsetY) * 0.05;

          orb.outerGroup.rotation.y += dt * 0.09 * sign;
          orb.outerGroup.rotation.x += dt * 0.03;

          orb.midGroup.rotation.y -= dt * 0.18 * sign;
          orb.midGroup.rotation.z += dt * 0.06;

          orb.innerGroup.rotation.y += dt * 0.32 * sign;
          orb.innerGroup.rotation.x -= dt * 0.12;

          orb.ring1.rotation.z += dt * 0.3;
          orb.ring2.rotation.z -= dt * 0.22;
        });

        // ==========================================
        // 2. Middle Shell Scatter & Settle Every 10s
        // ==========================================
        const cycleTime = t % SCATTER_CYCLE;
        if (cycleTime < SCATTER_DURATION) {
          const p = cycleTime / SCATTER_DURATION;
          const s = Math.sin(Math.PI * p);
          const scatterMagnitude = s * s * 0.68;

          orbs.forEach((orb) => {
            if (!orb.rig.visible) return;
            for (let i = 0; i < orb.midData.uniqueVerts.length; i++) {
              const x = orb.midOrigVerts[i * 3] + orb.midScatterDirs[i * 3] * scatterMagnitude;
              const y = orb.midOrigVerts[i * 3 + 1] + orb.midScatterDirs[i * 3 + 1] * scatterMagnitude;
              const z = orb.midOrigVerts[i * 3 + 2] + orb.midScatterDirs[i * 3 + 2] * scatterMagnitude;
              orb.midPtPos[i * 3] = x;
              orb.midPtPos[i * 3 + 1] = y;
              orb.midPtPos[i * 3 + 2] = z;
            }
            orb.midPtGeo.attributes.position.needsUpdate = true;

            for (let e = 0; e < orb.midData.edges.length; e++) {
              const [u, v] = orb.midData.edges[e];
              orb.midLinePos[e * 6] = orb.midPtPos[u * 3];
              orb.midLinePos[e * 6 + 1] = orb.midPtPos[u * 3 + 1];
              orb.midLinePos[e * 6 + 2] = orb.midPtPos[u * 3 + 2];
              orb.midLinePos[e * 6 + 3] = orb.midPtPos[v * 3];
              orb.midLinePos[e * 6 + 4] = orb.midPtPos[v * 3 + 1];
              orb.midLinePos[e * 6 + 5] = orb.midPtPos[v * 3 + 2];
            }
            orb.midLineGeo.attributes.position.needsUpdate = true;
            orb.midLineMat.opacity = 0.75 * (1 - 0.45 * scatterMagnitude);
          });
          (scatterLabel.material as THREE_TYPES.SpriteMaterial).opacity = 0.85 * scatterMagnitude;
          isScattering = true;
        } else if (isScattering) {
          orbs.forEach((orb) => {
            orb.midPtPos.set(orb.midOrigVerts);
            orb.midPtGeo.attributes.position.needsUpdate = true;
            for (let e = 0; e < orb.midData.edges.length; e++) {
              const [u, v] = orb.midData.edges[e];
              orb.midLinePos[e * 6] = orb.midOrigVerts[u * 3];
              orb.midLinePos[e * 6 + 1] = orb.midOrigVerts[u * 3 + 1];
              orb.midLinePos[e * 6 + 2] = orb.midOrigVerts[u * 3 + 2];
              orb.midLinePos[e * 6 + 3] = orb.midPtPos[v * 3];
              orb.midLinePos[e * 6 + 4] = orb.midPtPos[v * 3 + 1];
              orb.midLinePos[e * 6 + 5] = orb.midPtPos[v * 3 + 2];
            }
            orb.midLineGeo.attributes.position.needsUpdate = true;
            orb.midLineMat.opacity = 0.75;
          });
          (scatterLabel.material as THREE_TYPES.SpriteMaterial).opacity = 0;
          isScattering = false;
        }

        // ==========================================
        // 3. Floating Wireframe Cubes
        // (Orbit, Bob, Tumble, Repel from Pointer)
        // ==========================================
        for (let i = 0; i < cubes.length; i++) {
          const cb = cubes[i];
          const u = cb.userData as CubeData;
          u.theta += u.orbit * dt;
          const r = u.radius + Math.sin(t * u.bobSpeed + u.bobPhase) * u.bobAmp;

          tmpVec.set(
            Math.sin(u.phi) * Math.cos(u.theta) * r * 1.35,
            Math.cos(u.phi) * r * 0.85,
            Math.sin(u.phi) * Math.sin(u.theta) * r
          );

          u.offTarget.set(0, 0, 0);
          if (ptr.active) {
            projVec.copy(tmpVec).project(camera);
            const dx = (projVec.x - ptr.x) * aspect;
            const dy = projVec.y - ptr.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPEL_RADIUS) {
              const pushFactor = Math.pow(1 - dist / REPEL_RADIUS, 2) * 3.2;
              const inv = dist > 0.0001 ? 1 / dist : 0;
              u.offTarget.set(dx * inv * pushFactor, dy * inv * pushFactor, -pushFactor * 0.5);
            }
          }
          u.off.lerp(u.offTarget, 0.12);
          cb.position.copy(tmpVec).add(u.off);

          cb.rotation.x += u.spin.x * dt;
          cb.rotation.y += u.spin.y * dt;
          cb.rotation.z += u.spin.z * dt;
          cb.scale.setScalar(u.baseScale * (1 + 0.06 * Math.sin(t * 1.4 + u.bobPhase)));
        }

        // ==========================================
        // 4. Labels tracking cubes & drifting
        // ==========================================
        for (let hI = 0; hI < hashLabels.length; hI++) {
          const hlb = hashLabels[hI];
          hlb.sp.position.copy(hlb.cube.position);
          hlb.sp.position.y += hlb.cube.scale.x * 0.85 + 0.15;
        }

        for (let m = 0; m < mathLabels.length; m++) {
          const ml = mathLabels[m];
          ml.sp.position.set(
            ml.base.x + Math.sin(t * 0.32 + ml.phase) * 0.12,
            ml.base.y + Math.sin(t * 0.46 + ml.phase * 1.2) * 0.1,
            0
          );
        }

        // ==========================================
        // 5. Lines & Moving Light Dots Between Cubes
        // ==========================================
        let linkCount = 0;
        for (let a = 0; a < cubes.length && linkCount < MAX_LINKS; a++) {
          const pa = cubes[a].position;
          for (let b = a + 1; b < cubes.length && linkCount < MAX_LINKS; b++) {
            const pb = cubes[b].position;
            const ddx = pa.x - pb.x;
            const ddy = pa.y - pb.y;
            const ddz = pa.z - pb.z;
            if (ddx * ddx + ddy * ddy + ddz * ddz < linkDistanceThresholdSq) {
              const offset = linkCount * 6;
              linkPos[offset] = pa.x;
              linkPos[offset + 1] = pa.y;
              linkPos[offset + 2] = pa.z;
              linkPos[offset + 3] = pb.x;
              linkPos[offset + 4] = pb.y;
              linkPos[offset + 5] = pb.z;
              linkCount++;
            }
          }
        }
        linkGeo.setDrawRange(0, linkCount * 2);
        linkGeo.attributes.position.needsUpdate = true;

        const pulseCount = Math.min(linkCount, MAX_PULSES);
        for (let p = 0; p < pulseCount; p++) {
          const progress = (t * 0.48 + p * 0.35) % 1.0;
          const lo = p * 6;
          pulsePos[p * 3] = linkPos[lo] + (linkPos[lo + 3] - linkPos[lo]) * progress;
          pulsePos[p * 3 + 1] = linkPos[lo + 1] + (linkPos[lo + 4] - linkPos[lo + 1]) * progress;
          pulsePos[p * 3 + 2] = linkPos[lo + 2] + (linkPos[lo + 5] - linkPos[lo + 2]) * progress;
        }
        pulseGeo.setDrawRange(0, pulseCount);
        pulseGeo.attributes.position.needsUpdate = true;

        // ==========================================
        // 6. Corner 3D Lattice & Dust Motion
        // ==========================================
        cornerLattice.rotation.y += dt * 0.22;
        dustMesh.rotation.y += dt * 0.012;
        dustMesh.position.y = Math.sin(t * 0.2) * 0.12;

        renderer.render(scene, camera);
      }

      animId = requestAnimationFrame(renderFrame);

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('pointerup', onPointerDeactivate);
        window.removeEventListener('touchend', onPointerDeactivate);
        window.removeEventListener('pointerleave', onPointerDeactivate);
        disposables.forEach((d) => {
          try {
            d.dispose();
          } catch {}
        });
        if (renderer) {
          try {
            renderer.dispose();
          } catch {}
        }
      };
    });

    return () => {
      isCancelled = true;
      if (cleanupFn) cleanupFn();
    };
  }, [enableInteraction]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden bg-black ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block bg-black" />
    </div>
  );
};

export default LatticeOrb;
