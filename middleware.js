import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const secret = process.env.SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  console.log("Middleware Token:", token);

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token.role === 'Mahasiswa') {
    if (pathname.startsWith('/saran/board/')) {
      const newPath = pathname.replace(/^\/saran/, '/mahasiswa/saran');
      return NextResponse.redirect(new URL(newPath, req.url));
    }
    if (pathname.startsWith('/mahasiswa/saran/board') || pathname === '/mahasiswa/dashboard') {
      return NextResponse.next();
    }
    if (pathname.startsWith('/mahasiswa/saran/saran') || pathname === '/mahasiswa/saran') {
      return NextResponse.next();
    }
    if (pathname === '/saran' || pathname.startsWith('/saran/')) {
      return NextResponse.redirect(new URL('/403', req.url));
    }
    return NextResponse.redirect(new URL('/mahasiswa/dashboard', req.url));
  }

  // if (token.role !== 'Super Admin' && token.role !== 'Admin') {
  //   return NextResponse.redirect(new URL('/403', req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/add-departements',
    '/add-saran',
    '/dashboard',
    '/users',
    '/departements/:path*',
    '/mahasiswa/:path*',
    '/saran/:path*',
  ],
};
