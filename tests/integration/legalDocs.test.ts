import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db/client';
import { getPublished, findByKindAndVersion } from '@/lib/db/repositories/legalDocRepo';

function applyLegalSeed() {
  const db = getDb();
  // Seed both v1.0 and v1.1, retire v1.0
  for (const [kind, version, file, status] of [
    ['cgu', '1.0', 'cgu-v1.md', 'retired'],
    ['pdc', '1.0', 'pdc-v1.md', 'retired'],
    ['mentions', '1.0', 'mentions-v1.md', 'retired'],
    ['cgu', '1.1', 'cgu-v1_1.md', 'published'],
    ['pdc', '1.1', 'pdc-v1_1.md', 'published'],
    ['mentions', '1.1', 'mentions-v1_1.md', 'published'],
  ] as const) {
    const filePath = path.join(process.cwd(), 'src', 'content', 'legal', file);
    const body = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(body).digest('hex');
    db.prepare(
      `INSERT OR IGNORE INTO legal_documents (kind, version, effective_at, published_at, body_path, body_hash, status)
       VALUES (?, ?, date('now'), date('now'), ?, ?, ?)`
    ).run(kind, version, `src/content/legal/${file}`, hash, status);
  }
}

beforeEach(() => {
  applyLegalSeed();
});

describe('legalDocs', () => {
  it('returns the v1.1 row as the currently published CGU', () => {
    const cgu = getPublished('cgu');
    expect(cgu.version).toBe('1.1');
    expect(cgu.status).toBe('published');
  });

  it('exposes a body_hash matching the SHA-256 of cgu-v1_1.md', () => {
    const cgu = getPublished('cgu');
    const filePath = path.join(process.cwd(), 'src', 'content', 'legal', 'cgu-v1_1.md');
    const expectedHash = crypto
      .createHash('sha256')
      .update(fs.readFileSync(filePath, 'utf8'))
      .digest('hex');
    expect(cgu.body_hash).toBe(expectedHash);
  });

  it('keeps v1.0 retrievable as retired for traceability', () => {
    const v1_0 = findByKindAndVersion('cgu', '1.0');
    expect(v1_0).toBeDefined();
    expect(v1_0!.status).toBe('retired');
  });

  it('SC-009: published v1.1 markdown contains no reference to "Contact Mutuelle"', () => {
    for (const file of ['cgu-v1_1.md', 'pdc-v1_1.md', 'mentions-v1_1.md']) {
      const body = fs.readFileSync(
        path.join(process.cwd(), 'src', 'content', 'legal', file),
        'utf8'
      );
      expect(body.toLowerCase()).not.toContain('contact mutuelle');
      expect(body.toLowerCase()).not.toContain('contact-mutuelle');
    }
  });
});
