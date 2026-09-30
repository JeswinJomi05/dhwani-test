import { NextRequest, NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../lib/request-origin';
import { fetchUpstream, UpstreamError } from '../../../../lib/upstream';

const base = (process.env.PGBEE_API_URL || 'https://server.pgbee.co.in').trim().replace(/\/+$/, '');
const allowed = new Set(['POST auth/guest/register', 'POST auth/guest/verify-otp', 'POST auth/guest/refresh', 'POST auth/guest/logout', 'POST otp/send', 'POST bookings/stayhub/checkout', 'GET bookings/stayhub', 'POST payments/stayhub/verify']);

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  if (!allowed.has(`${request.method} ${path}`) && !(request.method === 'PATCH' && /^bookings\/stayhub\/[\da-f-]+\/cancel$/i.test(path))) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  if (request.method !== 'GET' && !isSameOriginRequest(request.headers, request.nextUrl.origin)) return NextResponse.json({ message: 'Invalid request origin' }, { status: 403 });
  let body;
  if (request.method !== 'GET') {
    try {
      body = await request.json();
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
    } catch {
      return NextResponse.json({ message: 'Request body must be a JSON object.' }, { status: 400 });
    }
  }
  try {
    if (path === 'auth/guest/refresh') {
      const refreshToken = request.cookies.get('pgbee_refresh')?.value;
      if (!refreshToken) return NextResponse.json({ message: 'Please sign in.' }, { status: 401 });
      body = { refreshToken };
    }
    if (path === 'otp/send') body = { phoneNo: body.phoneNo, purpose: 'guest_login' };
    const token = request.cookies.get('pgbee_access')?.value;
    const upstream = await fetchUpstream(`${base}/${path}`, {
      method: request.method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error',
    });
    const result = upstream.result;
    const access = result.data?.accessToken;
    const refresh = result.data?.refreshToken;
    if (result.data) { delete result.data.accessToken; delete result.data.refreshToken; }
    const response = NextResponse.json(result, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
    if (upstream.ok && access) response.cookies.set('pgbee_access', access, { ...options, maxAge: 900 });
    if (upstream.ok && refresh) response.cookies.set('pgbee_refresh', refresh, options);
    if (path === 'auth/guest/logout' || (path === 'auth/guest/refresh' && upstream.status === 401)) {
      response.cookies.delete('pgbee_access'); response.cookies.delete('pgbee_refresh');
    }
    return response;
  } catch (error) {
    const failure = error instanceof UpstreamError ? error : new UpstreamError('The booking service encountered an error. Please try again.', 502, 'API_PROXY_ERROR');
    // Never log request bodies, tokens, or upstream response bodies.
    console.error(`[PgBee proxy] ${request.method} /${path}: ${failure.code}. Check PGBEE_API_URL and backend connectivity.`);
    return NextResponse.json({ message: failure.message, code: failure.code }, { status: failure.status, headers: { 'Cache-Control': 'no-store' } });
  }
}
export { handle as GET, handle as POST, handle as PATCH };
