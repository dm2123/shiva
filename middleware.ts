import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import { UserRole } from '@/types/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static files, assets, and Next.js internal API/build routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const cookieHeader = req.headers.get('cookie');
  const sessionId = parseSessionCookie(cookieHeader);
  const session = sessionId ? await validateServerSession(sessionId) : null;

  // 1. PUBLIC AUTH ROUTES (/login, /register, /teacher/login, /admin/login)
  const isPublicAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/teacher/login' ||
    pathname === '/admin/login';

  if (isPublicAuthRoute) {
    if (session) {
      if (session.role === UserRole.STUDENT) {
        return NextResponse.redirect(new URL('/app', req.url));
      } else if (session.role === UserRole.TEACHER) {
        return NextResponse.redirect(new URL('/teacher', req.url));
      } else if (session.role === UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    return NextResponse.next();
  }

  // 2. STUDENT PORTAL (/app/*) -> ALLOWED FOR STUDENT ONLY
  if (pathname.startsWith('/app')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (session.role !== UserRole.STUDENT) {
      const targetPortal = session.role === UserRole.TEACHER ? '/teacher' : '/admin';
      return NextResponse.redirect(new URL(targetPortal, req.url));
    }
    return NextResponse.next();
  }

  // 3. TEACHER PORTAL (/teacher/*) -> ALLOWED FOR TEACHER ONLY
  if (pathname.startsWith('/teacher')) {
    if (!session) {
      return NextResponse.redirect(new URL('/teacher/login', req.url));
    }
    if (session.role !== UserRole.TEACHER) {
      const targetPortal = session.role === UserRole.STUDENT ? '/app' : '/admin';
      return NextResponse.redirect(new URL(targetPortal, req.url));
    }
    return NextResponse.next();
  }

  // 4. ADMIN PORTAL (/admin/*) -> ALLOWED FOR ADMIN ONLY
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (session.role !== UserRole.ADMIN) {
      const targetPortal = session.role === UserRole.STUDENT ? '/app' : '/teacher';
      return NextResponse.redirect(new URL(targetPortal, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
