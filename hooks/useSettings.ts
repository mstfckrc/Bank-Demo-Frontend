import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { customerService } from "@/services/customer.service";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export function useSettings(isAdmin: boolean = false) {
  const { user, updateUser } = useAuthStore();
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "" });

  // Kullanıcı bilgisi store'dan geldiğinde formu doldur
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user?.tcNo) return;
    try {
      setLoadingProfile(true);
      
      // 🚀 ZEKİ KISIM: Adminse admin servisine, değilse müşteri servisine git!
      const updatedData = isAdmin 
        ? await adminService.updateCustomer(user.tcNo, profileForm)
        : await customerService.updateProfile(profileForm);
      
      // Store'u güncelle
      updateUser({
        fullName: updatedData.fullName,
        email: updatedData.email
      });
      
      toast.success("Profil bilgileri başarıyla güncellendi.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoadingPass(true);
      await customerService.changePassword(passForm); // Şifre servisi ikisinde de aynı
      toast.success("Şifreniz başarıyla değiştirildi.");
      setPassForm({ oldPassword: "", newPassword: "" }); // Formu temizle
    } finally {
      setLoadingPass(false);
    }
  };

  return {
    user,
    profileForm,
    setProfileForm,
    passForm,
    setPassForm,
    loadingProfile,
    loadingPass,
    handleUpdateProfile,
    handleChangePassword
  };
}