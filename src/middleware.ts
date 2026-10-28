import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'samitypro_jwt_fallback_secret_production_ready_2026';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
const AUTH_COOKIE_NAME = 'samity_token';

// Paths that are accessible without authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/bootstrap',
  '/api/app/version',
  '/api/db/health',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Next.js internal static assets and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))
  ) {
    // If user is already authenticated and visits /login or /register, redirect to dashboard
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        try {
          await jwtVerify(token, encodedSecret);
          return NextResponse.redirect(new URL('/', request.url));
        } catch {
          // Token invalid, allow login page
        }
      }
    }
    return NextResponse.next();
  }

  // 2. Check for auth cookie on protected routes
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    // If it's an API route, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'লগইন করুন (Authentication required)',
          errorCode: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }
    // Redirect web user to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token signature and expiration
    const { payload } = await jwtVerify(token, encodedSecret);

    // Pass authenticated user context via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    if (payload.tenantId) {
      requestHeaders.set('x-tenant-id', payload.tenantId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Token expired or invalid
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন। (Session expired)',
          errorCode: 'AUTH_TOKEN_EXPIRED'
        },
        { status: 401 }
      );
    }

    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
