import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import Cookies from "js-cookie";
import { Role, ApprovalStatus, UserProfileResponse } from "../types";

// 🚀 V2: State'te tutacağımız kullanıcı modelimiz güncellendi
export interface AuthUser {
  identityNumber: string; // tcNo yerine artık identityNumber
  profileName: string;    // fullName yerine artık profileName
  email: string;
  role: Role;             // RETAIL_CUSTOMER, CORPORATE_MANAGER veya ADMIN
  status: ApprovalStatus; 
}

// Zustand Depomuzun (Store) Arayüzü
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // Aksiyonlar
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Başlangıç değerleri
        user: null,
        token: null,
        isAuthenticated: false,

        // 1. GİRİŞ YAPMA (LOGIN)
        login: (user, token) => {
          // Middleware için cookie ayarı
          Cookies.set("token", token, {
            expires: 1, // 1 gün
            secure: true,
            sameSite: "strict",
          });
          set({ user, token, isAuthenticated: true });
        },

        // 2. ÇIKIŞ YAPMA (LOGOUT)
        logout: () => {
          Cookies.remove("token");
          set({ user: null, token: null, isAuthenticated: false });
        },

        // 3. PROFİL GÜNCELLEME
        updateUser: (updatedFields) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedFields } : null,
          })),
      }),
      {
        name: "bank-auth-storage", // LocalStorage anahtarı değişmedi, ancak içindeki yapı değişti.
      },
    ),
  ),
);