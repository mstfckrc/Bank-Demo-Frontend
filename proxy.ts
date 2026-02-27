// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/user') || pathname.startsWith('/dashboard');

  // 1. Token Yoksa: Korumalı alanlara girişi engelle
  if (!token) {
    if (isAdminRoute || isUserRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 2. Token Varsa: Rolü kontrol et
  // middleware.ts içindeki try-catch kısmı:

  try {
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // 🚀 ÇÖZÜM: Eksik '=' işaretlerini tamamlayarak atob() hatasını (çökmeyi) önlüyoruz
    const pad = payloadBase64.length % 4;
    const paddedBase64 = pad > 0 ? payloadBase64 + '='.repeat(4 - pad) : payloadBase64;
    
    const decodedJson = atob(paddedBase64);
    const payload = JSON.parse(decodedJson);
    
    const rawRole = payload.role || "USER";
    const role = String(rawRole).includes("ADMIN") ? "ADMIN" : "USER";

    if (isAuthRoute) {
      const redirectUrl = role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

  } catch (error) {
    // Eğer token gerçekten bozuksa temizle ve at
    console.error("Middleware Token Çözme Hatası:", error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register', '/admin/:path*', '/user/:path*', '/dashboard/:path*'],
};