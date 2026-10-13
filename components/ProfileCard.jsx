'use client';

import { memo, useEffect, useRef } from 'react';
import './ProfileCard.css';

const THEMES = {
  dark: {
    '--pc-frame': 'rgba(38, 35, 46, 0.66)',
    '--pc-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--pc-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--pc-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--pc-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--pc-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--pc-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--pc-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)'
  },
  light: {
    '--pc-frame': 'rgba(240, 240, 243, 0.8)',
    '--pc-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--pc-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--pc-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--pc-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--pc-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--pc-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--pc-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)'
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ProfileCard = ({
  avatarUrl = '',
  name = '',
  theme = 'dark',
  backdropColor,
  radius = 16,
  enableTilt = true,
  tiltStrength = 10,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  className = ''
}) => {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const settingsRef = useRef({ enableTilt, tiltStrength, mobileTiltSensitivity });

  useEffect(() => {
    settingsRef.current = { enableTilt, tiltStrength, mobileTiltSensitivity };
  }, [enableTilt, tiltStrength, mobileTiltSensitivity]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let touchId = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const style = root.style;
      style.setProperty('--pc-rotate-x', `${(y.p * angle).toFixed(3)}deg`);
      style.setProperty('--pc-rotate-y', `${(-x.p * angle).toFixed(3)}deg`);
    };

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const stiffness = 120;
      const damping = 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx, ny) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      wake();
    };

    const aimAt = event => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const release = () => aim(0, 0);

    const onEnter = event => {
      if (event.pointerType === 'mouse') aimAt(event);
    };
    const onMove = event => {
      if (event.pointerType === 'mouse' || event.pointerId === touchId) aimAt(event);
    };
    const onLeave = event => {
      if (event.pointerType === 'mouse') release();
    };
    const onDown = event => {
      if (event.pointerType === 'mouse') return;
      touchId = event.pointerId;
      aimAt(event);
    };
    const onUp = event => {
      if (event.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);

    engineRef.current = { aim, release, write };
    write();

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.write();
  }, [enableTilt, tiltStrength]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enableMobileTilt) return;

    let listening = false;
    const onOrientation = event => {
      if (event.beta == null || event.gamma == null) return;
      const sensitivity = settingsRef.current.mobileTiltSensitivity;
      engineRef.current?.aim((event.gamma * sensitivity) / 150, ((event.beta - 20) * sensitivity) / 150);
    };
    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener('deviceorientation', onOrientation);
    };
    const onClick = () => {
      const Motion = window.DeviceOrientationEvent;
      if (Motion && typeof Motion.requestPermission === 'function') {
        Motion.requestPermission()
          .then(state => {
            if (state === 'granted') listen();
          })
          .catch(() => {});
      } else {
        listen();
      }
    };

    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [enableMobileTilt]);

  const palette = theme === 'light' ? 'light' : 'dark';
  const backdrop = backdropColor
    ? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 12%) 0%, color-mix(in srgb, ${backdropColor}, #000000 18%) 100%)`
    : 'var(--pc-tile)';

  return (
    <div
      ref={rootRef}
      className={`profile-card ${className}`.trim()}
      style={{
        ...THEMES[palette],
        '--pc-radius': `${Math.max(0, radius)}px`,
        '--pc-backdrop': backdrop
      }}
    >
      <div className="profile-card__body">
        <div className="profile-card__tile">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="profile-card__photo" src={avatarUrl} alt={name || ''} loading="lazy" draggable={false} />
          )}
          {name && (
            <>
              <span className="profile-card__scrim" />
              <div className="profile-card__info">
                <h3 className="profile-card__name">{name}</h3>
              </div>
            </>
          )}
          <span className="profile-card__tile-rim" />
        </div>
        <span className="profile-card__rim" />
      </div>
    </div>
  );
};

export default memo(ProfileCard);
