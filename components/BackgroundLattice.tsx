'use client';

import React, { useEffect, useRef } from 'react';

interface BackgroundLatticeProps {
  className?: string;
}

export default function BackgroundLattice({ className = '' }: BackgroundLatticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let isRunning = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Pointer state
    const mouse = {
      x: -9999,
      y: -9999,
      tx: -9999,
      ty: -9999,
      radius: 200,
    };

    // Scroll tracking
    let scrollY = 0;
    let targetScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY || window.pageYOffset || 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX !== undefined && clientY !== undefined) {
        mouse.tx = clientX;
        mouse.ty = clientY;
      }
    };

    const handlePointerLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    // Resize handler
    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    resize();
    handleScroll();
    scrollY = targetScrollY;

    // Cryptographic formulas watermark floating items
    const mathWatermarks = [
      { text: 'Λ(B) = { B·z | z ∈ ℤⁿ }', xRatio: 0.12, yRatio: 0.22, depth: 450, opacity: 0.22 },
      { text: 'A·s + e ≡ b (mod q)', xRatio: 0.82, yRatio: 0.35, depth: 380, opacity: 0.26 },
      { text: 'q = 3329 · ML-KEM', xRatio: 0.15, yRatio: 0.65, depth: 520, opacity: 0.2 },
      { text: 'R_q = ℤ_q[x]/(x²⁵⁶ + 1)', xRatio: 0.85, yRatio: 0.78, depth: 410, opacity: 0.24 },
      { text: '||v|| ≤ γ · λ₁(Λ) [SVP_γ]', xRatio: 0.5, yRatio: 0.88, depth: 320, opacity: 0.18 },
      { text: 'e ← χ_σ · Discrete Gaussian', xRatio: 0.78, yRatio: 0.15, depth: 560, opacity: 0.2 },
      { text: 'dim(Λ) = 512 · NIST FIPS 203', xRatio: 0.25, yRatio: 0.45, depth: 490, opacity: 0.19 },
    ];

    // Grid configuration for 3D Cryptographic Lattice
    const COLS = 22; // X axis points
    const ROWS = 28; // Z axis points (depth)
    const SPACING_X = 90;
    const SPACING_Z = 75;

    // Traveling quantum data packets along the lattice edges
    interface LatticePulse {
      col: number;
      row: number;
      dir: 'x' | 'z';
      progress: number;
      speed: number;
      color: string;
      size: number;
    }

    const PULSE_COUNT = 18;
    const pulses: LatticePulse[] = [];

    const resetPulse = (p: LatticePulse) => {
      p.col = Math.floor(Math.random() * (COLS - 1));
      p.row = Math.floor(Math.random() * (ROWS - 1));
      p.dir = Math.random() > 0.45 ? 'x' : 'z';
      p.progress = 0;
      p.speed = 0.005 + Math.random() * 0.012;
      p.color = Math.random() > 0.4 ? '#3ddc84' : '#a7f3d0';
      p.size = 2.2 + Math.random() * 2.2;
    };

    for (let i = 0; i < PULSE_COUNT; i++) {
      const p: LatticePulse = {
        col: 0,
        row: 0,
        dir: 'x',
        progress: Math.random(),
        speed: 0.008,
        color: '#3ddc84',
        size: 3,
      };
      resetPulse(p);
      p.progress = Math.random(); // spread initial progress
      pulses.push(p);
    }

    let startTime = performance.now();

    // Visibility change handling (pause animation when tab is not active)
    const onVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        if (!isRunning) {
          isRunning = true;
          startTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Main render loop
    const render = (time: number) => {
      if (!isRunning) return;

      const elapsed = time - startTime;
      const t = elapsed * 0.001;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.08;

      // Smooth mouse interpolation
      if (mouse.tx > -9000) {
        mouse.x += (mouse.tx - mouse.x) * 0.1;
        mouse.y += (mouse.ty - mouse.y) * 0.1;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep space ambient backdrop with subtle green quantum glow
      const cx = width * 0.5;
      const cy = height * 0.5;

      // Camera parameters
      // As user scrolls down, camera smoothly descends and pushes deeper into lattice
      const totalPageHeight = document.documentElement.scrollHeight - window.innerHeight || 1;
      const scrollRatio = Math.max(0, Math.min(1, scrollY / totalPageHeight));

      const camX = 0;
      const camY = -230 + Math.sin(t * 0.3) * 15 - scrollRatio * 90;
      const camZ = -220 + scrollRatio * 320;
      const fov = 420;

      // Project 3D coordinate to 2D screen coordinate
      const project = (wx: number, wy: number, wz: number) => {
        const rx = wx - camX;
        const ry = wy - camY;
        const rz = wz - camZ;

        if (rz <= 20) return null; // Behind camera clipping

        const scale = fov / rz;
        const sx = cx + rx * scale;
        const sy = cy + ry * scale;

        return { sx, sy, scale, rz };
      };

      // 3D Grid points calculation
      // Grid centered on X, extending deep along Z
      const gridOriginX = -((COLS - 1) * SPACING_X) * 0.5;
      const gridOriginZ = 60;

      // 2D Array to store projected positions
      const projGrid: ({ sx: number; sy: number; scale: number; rz: number; wy: number } | null)[][] = [];

      for (let c = 0; c < COLS; c++) {
        projGrid[c] = [];
        const wx = gridOriginX + c * SPACING_X;

        for (let r = 0; r < ROWS; r++) {
          const wz = gridOriginZ + r * SPACING_Z;

          // Undulating cryptographic wave function
          // Simulates quantum wavepackets and error distributions across the lattice
          const distFromCenter = Math.sqrt((c - COLS / 2) ** 2 + (r - ROWS / 2) ** 2);
          const wave1 = Math.sin(wx * 0.0035 + t * 0.9) * 28;
          const wave2 = Math.cos(wz * 0.0042 + t * 0.7 + distFromCenter * 0.18) * 22;
          const wave3 = Math.sin((wx + wz) * 0.0025 + t * 1.2) * 14;

          let wy = wave1 + wave2 + wave3;

          // Mouse deflection if cursor is active
          if (mouse.x > -9000) {
            const pTemp = project(wx, wy, wz);
            if (pTemp) {
              const dx = pTemp.sx - mouse.x;
              const dy = pTemp.sy - mouse.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < mouse.radius * mouse.radius) {
                const factor = 1 - Math.sqrt(d2) / mouse.radius;
                wy -= factor * 45;
              }
            }
          }

          const proj = project(wx, wy, wz);
          if (proj) {
            projGrid[c][r] = { ...proj, wy };
          } else {
            projGrid[c][r] = null;
          }
        }
      }

      // Draw Lattice Edges (Lines along X and Z axes, plus subtle diagonals)
      ctx.lineWidth = 1;

      // 1. Lines along Z (columns pointing into depth)
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 1; r++) {
          const p1 = projGrid[c][r];
          const p2 = projGrid[c][r + 1];
          if (!p1 || !p2) continue;

          // Depth attenuation
          const avgZ = (p1.rz + p2.rz) * 0.5;
          const maxZ = gridOriginZ + ROWS * SPACING_Z;
          const depthRatio = Math.max(0, 1 - avgZ / (maxZ * 0.95));
          if (depthRatio <= 0.02) continue;

          const alpha = depthRatio * 0.22;
          ctx.strokeStyle = `rgba(61, 220, 132, ${alpha.toFixed(3)})`;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }

      // 2. Lines along X (horizontal rows across width)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const p1 = projGrid[c][r];
          const p2 = projGrid[c + 1][r];
          if (!p1 || !p2) continue;

          const avgZ = (p1.rz + p2.rz) * 0.5;
          const maxZ = gridOriginZ + ROWS * SPACING_Z;
          const depthRatio = Math.max(0, 1 - avgZ / (maxZ * 0.95));
          if (depthRatio <= 0.02) continue;

          // Every 4th row has slightly higher prominence to emphasize lattice basis vectors
          const isBasisRow = r % 4 === 0;
          const alpha = depthRatio * (isBasisRow ? 0.28 : 0.16);
          ctx.strokeStyle = isBasisRow
            ? `rgba(167, 243, 208, ${alpha.toFixed(3)})`
            : `rgba(61, 220, 132, ${alpha.toFixed(3)})`;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }

      // 3. Subtle diagonal basis vectors for crystalline lattice cells
      for (let c = 0; c < COLS - 1; c += 2) {
        for (let r = 0; r < ROWS - 1; r += 2) {
          const p1 = projGrid[c][r];
          const p2 = projGrid[c + 1][r + 1];
          if (!p1 || !p2) continue;

          const avgZ = (p1.rz + p2.rz) * 0.5;
          const maxZ = gridOriginZ + ROWS * SPACING_Z;
          const depthRatio = Math.max(0, 1 - avgZ / (maxZ * 0.95));
          if (depthRatio <= 0.05) continue;

          const alpha = depthRatio * 0.09;
          ctx.strokeStyle = `rgba(143, 191, 168, ${alpha.toFixed(3)})`;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
        }
      }

      // Draw Traveling Quantum Pulses
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1.0) {
          resetPulse(p);
          return;
        }

        const c1 = p.col;
        const r1 = p.row;
        const c2 = p.dir === 'x' ? Math.min(COLS - 1, c1 + 1) : c1;
        const r2 = p.dir === 'z' ? Math.min(ROWS - 1, r1 + 1) : r1;

        const pA = projGrid[c1]?.[r1];
        const pB = projGrid[c2]?.[r2];
        if (!pA || !pB) return;

        const curX = pA.sx + (pB.sx - pA.sx) * p.progress;
        const curY = pA.sy + (pB.sy - pA.sy) * p.progress;
        const curScale = pA.scale + (pB.scale - pA.scale) * p.progress;
        const avgZ = pA.rz + (pB.rz - pA.rz) * p.progress;

        const maxZ = gridOriginZ + ROWS * SPACING_Z;
        const depthRatio = Math.max(0, 1 - avgZ / maxZ);
        const alpha = depthRatio * 0.85;

        if (alpha <= 0.05) return;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(1, p.size * curScale * 1.2), 0, Math.PI * 2);
        ctx.fill();

        // Soft outer glow for the pulse
        ctx.fillStyle = '#3ddc84';
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(2, p.size * curScale * 2.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Lattice Vertices (Nodes)
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          const pt = projGrid[c][r];
          if (!pt) continue;

          const maxZ = gridOriginZ + ROWS * SPACING_Z;
          const depthRatio = Math.max(0, 1 - pt.rz / maxZ);
          if (depthRatio <= 0.05) continue;

          // Highlight primary basis nodes
          const isBasisNode = (c % 4 === 0 && r % 4 === 0) || (c === Math.floor(COLS / 2) && r % 2 === 0);
          const radius = (isBasisNode ? 2.5 : 1.3) * pt.scale;
          const alpha = depthRatio * (isBasisNode ? 0.8 : 0.45);

          ctx.fillStyle = isBasisNode ? '#a7f3d0' : '#3ddc84';
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, Math.max(0.7, radius), 0, Math.PI * 2);
          ctx.fill();

          // Subtle coordinate ping for basis nodes
          if (isBasisNode && depthRatio > 0.45) {
            ctx.fillStyle = '#3ddc84';
            ctx.globalAlpha = alpha * 0.25;
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, radius * 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw Floating Mathematical Formula Watermarks in deep space
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      mathWatermarks.forEach((wm, idx) => {
        // Subtle drift
        const driftX = Math.sin(t * 0.4 + idx * 1.5) * 20;
        const driftY = Math.cos(t * 0.35 + idx * 1.8) * 15;
        const wx = (wm.xRatio - 0.5) * width * 1.3 + driftX;
        const wz = wm.depth + Math.sin(t * 0.2 + idx) * 30;
        const wy = (wm.yRatio - 0.5) * height * 0.8 + driftY - 60;

        const p = project(wx, wy, wz);
        if (!p) return;

        const maxZ = gridOriginZ + ROWS * SPACING_Z;
        const depthRatio = Math.max(0, 1 - p.rz / maxZ);
        const alpha = depthRatio * wm.opacity;
        if (alpha <= 0.02) return;

        ctx.fillStyle = idx % 2 === 0 ? '#3ddc84' : '#8FBFA8';
        ctx.globalAlpha = alpha;
        ctx.fillText(wm.text, p.sx, p.sy);
      });
      ctx.globalAlpha = 1.0;

      // Dark radial vignette overlay to keep text ultra-legible
      const vigGrad = ctx.createRadialGradient(cx, cy, height * 0.2, cx, cy, Math.max(width, height) * 0.8);
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      vigGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.72)');
      vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');

      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-black ${className}`}
      aria-hidden="true"
      style={{ isolation: 'isolate' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
