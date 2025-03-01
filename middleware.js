import { NextResponse } from 'next/server';

export async function middleware(req) {

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard',
    '/mahasiswa/:path*',
    '/saran/:path*',
  ],
};
