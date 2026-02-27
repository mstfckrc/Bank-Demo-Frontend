"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
// 🚀 Not: Artık toast importuna gerek kalmayabilir eğer interceptor hallediyorsa

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    tcNo: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // 🚀 1. Sadece isteği atıyoruz
      await authService.register(formData);
      
      // 🚀 2. Toast'u sildik! (Interceptor zaten "Kayıt Başarılı" diyecektir)
      
      // 🚀 3. Doğrudan yönlendirme yapıyoruz
      router.push("/login");
    } catch (error: any) {
      // 🚀 4. Buradaki toast.error'u da sildik! 
      // Interceptor hatayı yakalayıp ekrana basacaktır.
      console.error("Kayıt hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Yeni Müşteri Kaydı</CardTitle>
          <p className="text-sm text-slate-500">Sec-Demo Bank ailesine hemen katılın.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input 
                placeholder="Mustafa Çakırca" 
                required 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>TC Kimlik Numarası</Label>
              <Input 
                placeholder="11 haneli TC No" 
                maxLength={11} 
                required 
                onChange={(e) => setFormData({...formData, tcNo: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input 
                type="email" 
                placeholder="ornek@mail.com" 
                required 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Şifre</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
            <Button className="w-full bg-slate-900 h-12 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Hesabımı Oluştur"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Zaten hesabınız var mı? </span>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}