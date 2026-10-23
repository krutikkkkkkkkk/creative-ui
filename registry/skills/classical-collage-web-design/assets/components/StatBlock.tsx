/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
'use client';
import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

/** Huge serif number that counts up on enter, with a small caps caption. */
export function StatBlock({ value, prefix = '', suffix = '', decimals = 0, label }: { value: number; prefix?: string; suffix?: string; decimals?: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: setN });
    return () => c.stop();
  }, [inView, reduce, value]);

  return (
    <div ref={ref}>
      <p className="font-serif text-stat text-ink">{prefix}{n.toFixed(decimals)}{suffix}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[.08em] text-ink-70">{label}</p>
    </div>
  );
}
