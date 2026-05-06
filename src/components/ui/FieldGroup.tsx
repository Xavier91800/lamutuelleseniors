import type { ReactNode } from 'react';

interface FieldGroupProps {
  legend?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldGroup({ legend, hint, children }: FieldGroupProps) {
  return (
    <fieldset className="rounded-lg border border-gray-200 p-4">
      {legend && (
        <legend className="px-2 text-base font-semibold text-gray-900">{legend}</legend>
      )}
      {hint && <p className="mb-3 text-sm text-gray-600">{hint}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}
