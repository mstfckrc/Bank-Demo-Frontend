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
  try {
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // 🚀 ÇÖZÜM: Eksik '=' işaretlerini tamamlayarak atob() hatasını (çökmeyi) önlüyoruz
    const pad = payloadBase64.length % 4;
    const paddedBase64 = pad > 0 ? payloadBase64 + '='.repeat(4 - pad) : payloadBase64;
    
    const decodedJson = atob(paddedBase64);
    const payload = JSON.parse(decodedJson);
    
    // 🚀 V2 GÜNCELLEMESİ: Backend'den gelen yeni rolleri işliyoruz
    const rawRole = String(payload.role || "");
    const isAdmin = rawRole.includes("ADMIN");
    // İleride ayırmak istersen diye buraya not düşüyoruz:
    // const isCorporate = rawRole.includes("CORPORATE_MANAGER");
    // const isRetail = rawRole.includes("RETAIL_CUSTOMER");

    // Giriş/Kayıt sayfalarındayken zaten giriş yapılmışsa, yetkisine göre panele at
    if (isAuthRoute) {
      const redirectUrl = isAdmin ? '/admin/dashboard' : '/user/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Admin sayfasına yetkisiz (Bireysel veya Kurumsal) girmeye çalışanı engelle
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

  } catch (error) {
    // Eğer token gerçekten bozuksa temizle ve login'e at
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