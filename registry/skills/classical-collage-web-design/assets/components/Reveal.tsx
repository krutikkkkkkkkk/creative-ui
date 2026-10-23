/* eslint-disable */
// @ts-nocheck
// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.
// If you copy it into your app, install the packages it imports and delete these four lines.
'use client';
import { motion, useReducedMotion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

/** Fade-up reveal. Wrap headline lines individually and pass index for stagger. */
export function Reveal({ children, index = 0, y = 20, className }: { children: React.ReactNode; index?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease, delay: reduce ? 0 : index * 0.1 }}
    >
      {children}
    </motion.div>
  );
}
