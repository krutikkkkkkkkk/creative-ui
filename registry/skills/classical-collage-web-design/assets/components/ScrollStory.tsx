'use client';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from 'motion/react';

type Thumb = { src: string; x: string; y: string; w: number; speed: number };

/** Calm, tall section: serif lines appear one after another while thumbnails drift. */
export function ScrollStory({ lines, thumbs }: { lines: string[]; thumbs: Thumb[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  if (reduce) {
    return (
      <section className="mx-auto max-w-3xl space-y-10 px-gutter py-section text-center">
        {lines.map((l) => <p key={l} className="font-serif text-display-m">{l}</p>)}
      </section>
    );
  }

  return (
    <section ref={ref} className="relative" style={{ height: `${100 + lines.length * 90}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {thumbs.map((t, i) => <DriftThumb key={i} t={t} p={scrollYProgress} />)}
        <div className="absolute inset-0 grid place-items-center px-gutter">
          {lines.map((l, i) => <Line key={l} text={l} i={i} n={lines.length} p={scrollYProgress} />)}
        </div>
      </div>
    </section>
  );
}

function Line({ text, i, n, p }: { text: string; i: number; n: number; p: MotionValue<number> }) {
  const s = i / n, e = (i + 1) / n;
  const opacity = useTransform(p, [s, s + 0.08, e - 0.04, e + 0.04], [0, 1, 1, i === n - 1 ? 1 : 0.2]);
  const y = useTransform(p, [s, s + 0.08, e + 0.04], [40, 0, i === n - 1 ? 0 : -40]);
  return (
    <motion.p style={{ opacity, y }} className="absolute max-w-[18ch] text-center font-serif text-display-m text-ink">
      {text}
    </motion.p>
  );
}

function DriftThumb({ t, p }: { t: Thumb; p: MotionValue<number> }) {
  const y = useTransform(p, [0, 1], [200 * t.speed, -400 * t.speed]);
  const scale = useTransform(p, [0, 1], [0.9, 1.05]);
  return (
    <motion.div aria-hidden className="absolute" style={{ left: t.x, top: t.y, width: t.w, y, scale }}>
      <Image src={t.src} alt="" width={t.w} height={Math.round(t.w * 4 / 3)} className="object-cover" />
    </motion.div>
  );
}
