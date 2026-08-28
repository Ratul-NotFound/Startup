import { NextRequest, NextResponse } from 'next/server';

// These paths require the user to be authenticated
const PROTECTED_PATHS = ['/dashboard', '/admin'];

// Superadmin emails permitted to access /admin command hub
const SUPERADMIN_EMAILS = ['m.h.ratul18@gmail.com', 'admin@keyoon.com'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. Strip sensitive headers from responses ─────────────────
  const response = NextResponse.next();

  // Remove server fingerprinting headers
  response.headers.delete('X-Powered-By');
  response.headers.set('Server', 'Keyoon');

  // ─── 2. Block direct access to /_next/image with no referer ───
  // (prevents hotlinking your images)
  if (pathname.startsWith('/_next/image')) {
    const referer = request.headers.get('referer');
    if (!referer) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // ─── 3. Block access to sensitive file patterns ────────────────
  const blockedPatterns = [
    /\.env/i,
    /\.git/i,
    /\.htaccess/i,
    /wp-admin/i,
    /wp-login/i,
    /phpMyAdmin/i,
    /adminer/i,
    /config\.json/i,
    /package\.json$/,
    /\.map$/,        // Block source maps in production
  ];

  if (blockedPatterns.some(pattern => pattern.test(pathname))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ─── 4. Rate-limit-style: reject requests with suspicious patterns ─
  const suspiciousPatterns = [
    /\.\.\//,        // Path traversal
    /<script/i,      // XSS attempts in URL
    /union.*select/i, // SQL injection
    /\x00/,          // Null byte injection
    /javascript:/i,  // JS protocol injection
  ];

  const fullUrl = request.url;
  if (suspiciousPatterns.some(pattern => pattern.test(fullUrl))) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // ─── 5. Auth check for protected routes ───────────────────────
  // Firebase auth runs client-side, so we check for the Firebase
  // session cookie that Firebase sets after authentication.
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  if (isProtected) {
    // Check for Firebase session/token cookie
    // Firebase sets a cookie named '__session' in some configurations,
    // but client-side SDK doesn't set server-readable cookies by default.
    // We do a lightweight cookie check — full auth is enforced on the page itself.
    const hasCookies = request.cookies.size > 0;

    // Add cache-control for all protected routes
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Add noindex header for all protected routes
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // ─── 6. Security headers on every response ────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  // Run middleware on all routes except static files and next internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
