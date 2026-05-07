import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { siteConfig } from '@/config/site';
import { getPublished } from '@/lib/db/repositories/legalDocRepo';
import type { LegalDocKind } from '@/types/consent';

interface LegalDocumentProps {
  kind: LegalDocKind;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'a',
    'blockquote',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'br',
  ],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
    th: ['scope'],
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: attribs.rel ?? 'noopener noreferrer',
        target: attribs.target ?? '_self',
      },
    }),
  },
};

function applyPlaceholders(markdown: string): string {
  return markdown
    .replaceAll('{{SITE_LEGAL_ENTITY}}', siteConfig.legalEntity)
    .replaceAll('{{SITE_LEGAL_ADDRESS}}', siteConfig.legalAddress)
    .replaceAll('{{SITE_EMAIL}}', siteConfig.email)
    .replaceAll('{{SITE_DPO_NAME}}', siteConfig.dpoName)
    .replaceAll('{{SITE_DPO_EMAIL}}', siteConfig.dpoEmail);
}

export async function LegalDocument({ kind }: LegalDocumentProps) {
  const doc = getPublished(kind);
  const filePath = path.join(process.cwd(), doc.body_path);
  const raw = fs.readFileSync(filePath, 'utf8');
  const interpolated = applyPlaceholders(raw);
  const html = sanitizeHtml(await marked.parse(interpolated), SANITIZE_OPTIONS);

  return (
    <article className="prose prose-lg mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-gray-500">
        Version {doc.version} — entrée en vigueur le {doc.effective_at}
      </p>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
