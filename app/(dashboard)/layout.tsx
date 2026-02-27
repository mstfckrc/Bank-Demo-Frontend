// app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Next.js hydration hatasını önlemek için sayfanın client'ta yüklendiğinden emin oluyoruz
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout(); // Zustand ve Cookie'den token'ı temizle
    router.push("/login"); // Login'e şutla
  };

  if (!isClient) return null; // Yüklenirken boş ekran (titremeyi önler)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ÜST MENÜ (NAVBAR) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">Sec-Demo Bank</Link>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded-md">
              {user?.role === "ADMIN" ? "Yönetici Paneli" : "Müşteri Paneli"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">
              Hoş geldin, {user?.fullName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK (Sayfalar buraya gelecek) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}