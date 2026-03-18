/** Create URL-safe slug from club name. Client-safe (no Node.js deps). */
export function clubToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
