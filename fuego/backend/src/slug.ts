import { getDb } from './db/schema';

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

export function resolveAvailableSlug(baseSlug: string): string {
  const db = getDb();
  const exists = (slug: string) =>
    !!db.prepare('SELECT 1 FROM restaurants WHERE slug = ?').get(slug);
  if (!exists(baseSlug)) return baseSlug;
  let suffix = 2;
  while (exists(`${baseSlug}-${suffix}`)) suffix++;
  return `${baseSlug}-${suffix}`;
}
