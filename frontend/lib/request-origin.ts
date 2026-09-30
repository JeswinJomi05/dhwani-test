/** Fetch Metadata describes the browser-facing URL, even behind a reverse proxy. */
export function isSameOriginRequest(headers: Headers, internalOrigin: string): boolean {
  const site = headers.get('sec-fetch-site');
  if (site !== null) return site === 'same-origin';

  // Older browsers may omit Fetch Metadata. Use the incoming Host rather than
  // Next's bind address (for example, 0.0.0.0 when browsing localhost).
  const origin = headers.get('origin');
  if (!origin || origin === 'null') return false;
  try {
    const source = new URL(origin);
    const target = new URL(internalOrigin);
    const host = headers.get('host');
    if (host) target.host = host;
    return source.origin === origin && source.origin === target.origin;
  } catch {
    return false;
  }
}
