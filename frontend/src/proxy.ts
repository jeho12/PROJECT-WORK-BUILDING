import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, favicon, api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Get token and role from cookies
  const token = request.cookies.get('siwes_token')?.value;
  const role = request.cookies.get('siwes_role')?.value;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardRoute =
    pathname.startsWith('/student') ||
    pathname.startsWith('/supervisor') ||
    pathname.startsWith('/admin');

  // 1. If trying to access dashboard routes and not logged in, redirect to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If logged in and trying to access auth routes, redirect to appropriate dashboard
  if (isAuthRoute && token && role) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // 3. Prevent cross-role page access
  if (token && role) {
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/supervisor') && role !== 'supervisor') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
