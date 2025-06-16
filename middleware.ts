import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Check for basic auth
  const basicAuth = request.headers.get('authorization');
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!password) {
    // If no password is set, allow access
    return NextResponse.next();
  }

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');
    
    if (pwd === password) {
      return NextResponse.next();
    }
  }

  // Return 401 and request authentication
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="PodInsightHQ Staging"',
    },
  });
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};