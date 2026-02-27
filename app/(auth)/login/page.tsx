// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { customerService } from "@/services/customer.service"; // Yeni servisimizi import ettik
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [tcNo, setTcNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Sadece Token'ı alıyoruz
      const response = await authService.login({ tcNo, password });
      const token = response.token;

      // 2. Middleware ve diğer istekler için Token'ı Cookie'ye yazıyoruz
      document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;

      // 3. 🚀 GERÇEK BİLGİLERİ YENİ ENDPOINT'TEN ÇEKİYORUZ
      // Artık token parçalamak yok, veritabanındaki en güncel halini alıyoruz
      const userProfile = await customerService.getProfile(token);

      // Esnek Rol Kontrolü: ROLE_ADMIN -> ADMIN
      const rawRole = userProfile.role || "USER";
      const cleanRole = String(rawRole).includes("ADMIN") ? "ADMIN" : "USER";

      // 4. Zustand Store Güncelleme
      login(
        {
          tcNo: userProfile.tcNo,
          fullName: userProfile.fullName,
          email: userProfile.email,
          role: cleanRole,
          status: userProfile.status,
        },
        token
      );

      // 5. Yönlendirme
      if (cleanRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Giriş Yap</CardTitle>
          <CardDescription>Sec-Demo Bank Yönetim Paneli</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tcNo">TC Kimlik Numarası</Label>
              <Input
                id="tcNo"
                type="text"
                inputMode="numeric"
                placeholder="11 haneli TC No"
                value={tcNo}
                onChange={(e) => setTcNo(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={11}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded font-medium">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Bağlanıyor..." : "Giriş Yap"}
            </Button>
          </form>

          {/* 🚀 EKLENEN KAYIT OL YÖNLENDİRMESİ */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Hemen Kayıt Ol
            </Link>
          </div>

        </CardContent>
        <CardFooter className="justify-center border-t p-4 mt-2 bg-slate-50/50 rounded-b-xl">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}