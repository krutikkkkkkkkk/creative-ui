/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

export type Feature = { eyebrow: string; title: string; description?: string; href?: string; image: { src: string; alt: string }; widget?: React.ReactNode };

/** Sticky stacking painting cards (Contra "ecosystem"). */
export function FeatureCardStack({ items }: { items: Feature[] }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((f, i) => <Card key={f.title} f={f} i={i} last={i === items.length - 1} />)}
    </div>
  );
}

function Card({ f, i, last }: { f: Feature; i: number; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, last || reduce ? 1 : 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, last || reduce ? 1 : 0.85]);

  return (
    <div ref={ref} className="md:sticky" style={{ top: 96 + i * 16 }}>
      <motion.article style={{ scale, opacity }} className="group">
        <div className="scrim-bottom relative aspect-[4/5] overflow-hidden rounded-lg md:aspect-[16/8]">
          <Image src={f.image.src} alt={f.image.alt} fill sizes="(min-width:768px) 1280px, 100vw"
                 className="object-cover transition-transform duration-1100 ease-out-quint group-hover:scale-[1.03]" />
          <p className="absolute left-6 top-6 z-10 text-label font-medium uppercase text-bg md:left-8 md:top-8">{f.eyebrow}</p>
          {f.widget && <div className="absolute inset-0 z-10 grid place-items-center">{f.widget}</div>}
          <h3 className="absolute bottom-6 left-6 z-10 max-w-[12ch] font-serif text-display-m text-bg transition-transform duration-700 ease-out-quint group-hover:-translate-y-1 md:bottom-8 md:left-8">
            {f.title}
          </h3>
        </div>
        {(f.description || f.href) && (
          <div className="mt-4 flex items-start justify-between gap-6 px-1">
            {f.description && <p className="max-w-md text-sm text-ink-70">{f.description}</p>}
            {f.href && <Link href={f.href} className="shrink-0 text-sm underline underline-offset-4">Learn more</Link>}
          </div>
        )}
      </motion.article>
    </div>
  );
}
