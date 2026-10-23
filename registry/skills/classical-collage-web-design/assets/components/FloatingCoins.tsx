/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
'use client';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';

type Coin = { src: string; x: string; y: string; size: number; rotate: number; delay: number; depth: number };

/** Cut-out objects (coins) that float slowly and follow the pointer slightly. */
export function FloatingCoins({ coins }: { coins: Coin[] }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 }), sy = useSpring(my, { stiffness: 40, damping: 20 });

  return (
    <div
      aria-hidden
      className="pointer-events-auto absolute inset-0"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {coins.map((c, i) => (
        <Parallax key={i} sx={sx} sy={sy} depth={reduce ? 0 : c.depth} style={{ left: c.x, top: c.y }}>
          <div
            className={reduce ? '' : 'animate-float'}
            style={{ ['--r' as string]: `${c.rotate}deg`, animationDelay: `${c.delay}s`, animationDuration: `${5 + (i % 3)}s` }}
          >
            <Image src={c.src} alt="" width={c.size} height={c.size} className="drop-shadow-[0_18px_24px_rgba(43,43,41,.25)]" />
          </div>
        </Parallax>
      ))}
    </div>
  );
}

function Parallax({ sx, sy, depth, style, children }: any) {
  const x = useTransform(sx, (v: number) => v * depth * 24);
  const y = useTransform(sy, (v: number) => v * depth * 24);
  return <motion.div className="absolute" style={{ ...style, x, y }}>{children}</motion.div>;
}
