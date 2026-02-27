// store/useAuthStore.ts
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import Cookies from "js-cookie";
import { Role, ApprovalStatus } from "../types"; // 🚀 ApprovalStatus'u import ettik

// State'te tutacağımız kullanıcı modelimiz
export interface AuthUser {
  tcNo: string;
  fullName: string;
  email: string;
  role: Role;
  status: ApprovalStatus; // 🚀 YENİ EKLENDİ: Artık store'umuz kullanıcının onay durumunu biliyor!
}

// Zustand Depomuzun (Store) Arayüzü
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // Aksiyonlar (Metotlar)
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Başlangıç değerleri (Boş)
        user: null,
        token: null,
        isAuthenticated: false,

        // 1. GİRİŞ YAPMA (LOGIN) AKSİYONU
        login: (user, token) => {
          Cookies.set("token", token, {
            expires: 1,
            secure: true,
            sameSite: "strict",
          });
          set({ user, token, isAuthenticated: true });
        },

        // 2. ÇIKIŞ YAPMA (LOGOUT) AKSİYONU
        logout: () => {
          Cookies.remove("token");
          set({ user: null, token: null, isAuthenticated: false });
        },

        // 🚀 Profil Güncelleme Aksiyonu
        updateUser: (updatedFields) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedFields } : null,
          })),
      }),
      {
        name: "bank-auth-storage",
      },
    ),
  ),
);
