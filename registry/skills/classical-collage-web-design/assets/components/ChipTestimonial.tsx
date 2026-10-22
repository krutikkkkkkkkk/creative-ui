'use client';
import { motion } from 'motion/react';

/** Contra-style testimonial: paint-chip bands sliding in, then a mint quote card. */
export function ChipTestimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  const chips = ['bg-chip-1', 'bg-chip-2', 'bg-chip-3', 'bg-chip-4'];
  return (
    <section className="relative overflow-hidden py-section">
      <div className="relative flex min-h-[80vh]">
        {chips.map((c, i) => (
          <motion.div key={c} aria-hidden className={`${c} w-[6vw] shrink-0`}
            initial={{ x: '-100%' }} whileInView={{ x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }} />
        ))}
        <motion.figure className="flex-1 bg-chip-5 px-8 py-16 md:px-20 md:py-24"
          initial={{ x: '-20%', opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}>
          <blockquote className="max-w-[22ch] font-serif text-quote text-ink">
            <span aria-hidden className="mr-2">&ldquo;</span>{quote}<span aria-hidden>&rdquo;</span>
          </blockquote>
          <figcaption className="mt-8 text-lg text-ink">— {name}, {role}</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
