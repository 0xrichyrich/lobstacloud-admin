import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// C-4 FIX: CORS middleware — restrict to admin domain only
// L-3 FIX: Server-side auth check for admin pages
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // C-4: Restrict CORS to admin domain
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['https://admin.redlobsta.com'];
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Vary', 'Origin');
  }
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  // L-3: Server-side auth check for admin routes
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for login page, API routes, and static assets
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }
  
  // Check for NextAuth session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
