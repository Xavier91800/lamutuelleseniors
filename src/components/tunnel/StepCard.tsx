'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StepCardProps {
  stepKey: string;
  children: ReactNode;
}

export function StepCard({ stepKey, children }: StepCardProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8"
    >
      {children}
    </motion.div>
  );
}
