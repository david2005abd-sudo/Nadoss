/**
 * basePath-aware client navigation.
 *
 * `next/link` and `next/navigation`'s router() apply the configured
 * `basePath` automatically, but a raw `window.location.assign('/dashboard')`
 * does NOT — on GitHub Pages (`basePath: '/Nadoss'`) that resolves to
 * `/dashboard`, which is a 404. Use these helpers instead of raw assigns.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.__NEXT_ROUTE_BASEPATH ?? '';

export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  if (path === '/') return `${base}/`;
  return `${base}${path}`;
}

/** Full page load to a basePath-correct URL. */
export function navigateTo(path: string): void {
  window.location.assign(withBase(path));
}
