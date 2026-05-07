import type { FaqItem } from '@/config/marketing';

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {items.map((item) => (
        <li key={item.question}>
          <details className="group">
            <summary className="flex cursor-pointer items-start justify-between gap-4 px-6 py-5 text-lg font-semibold text-gray-900 list-none [&::-webkit-details-marker]:hidden hover:bg-gray-50">
              <span>{item.question}</span>
              <svg
                aria-hidden="true"
                className="mt-1 h-6 w-6 shrink-0 text-[var(--color-brand)] transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-6 text-base leading-relaxed text-gray-700">
              {item.reponse}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
