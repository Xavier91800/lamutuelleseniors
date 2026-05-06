'use client';

import type { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { StepCard } from './StepCard';

interface FunnelLayoutProps {
  step: number;
  totalSteps: number;
  stepKey: string;
  title: string;
  subtitle?: string;
  labels?: string[];
  children: ReactNode;
}

export function FunnelLayout({
  step,
  totalSteps,
  stepKey,
  title,
  subtitle,
  labels,
  children,
}: FunnelLayoutProps) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <ProgressBar current={step} total={totalSteps} labels={labels} />
      <header className="mt-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-base text-gray-600">{subtitle}</p>}
      </header>
      <div className="mt-6">
        <StepCard stepKey={stepKey}>{children}</StepCard>
      </div>
    </section>
  );
}
