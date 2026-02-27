// --- ORTAK TİPLER ---
export type Role = "USER" | "ADMIN";
export type Currency = string;

// Müşteri Onay Durumları
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"; 

// 🚀 YENİ: Yüklü transferler için İşlem Onay Durumları (MASAK)
export type TransactionStatus = "COMPLETED" | "PENDING_APPROVAL" | "REJECTED"; 


// --- AUTH (GİRİŞ/KAYIT) MODELLERİ ---
export interface LoginRequest {
  tcNo: string;
  password: string;
}

export interface RegisterRequest {
  tcNo: string;
  fullName: string;
  email: string;
  password: string;
}

// Backend'den login/register olunca dönen token yapısı
export interface AuthResponse {
  token: string;
}

// --- MÜŞTERİ (CUSTOMER) MODELLERİ ---
export interface CustomerResponse {
  tcNo: string;
  fullName: string;
  email: string;
  role: Role;
  status: ApprovalStatus; // Müşteri durumu hala ApprovalStatus kullanır
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}


// --- HESAP (ACCOUNT) MODELLERİ ---
export interface AccountResponse {
  id: number;
  accountNumber: string;
  iban: string;      
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface CreateAccountRequest {
  currency: 'TRY' | 'USD' | 'EUR';
}


// --- İŞLEM (TRANSACTION) MODELLERİ ---
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

export interface TransferRequest {
  senderIban: string;
  receiverIban: string;
  amount: number;
  description?: string; 
}

export interface DepositRequest {
  iban: string;
  amount: number;
}

export interface TransactionResponse {
  referenceNo: string;
  amount: number;
  convertedAmount?: number; 
  transactionType: TransactionType;
  description: string;
  transactionDate: string; 
  senderAccountId?: number | null; 
  receiverAccountId?: number | null;
  // 🚀 ÇÖZÜM BURADA: Artık ApprovalStatus değil, TransactionStatus kullanıyor!
  status?: TransactionStatus; 
}


// --- HATA (EXCEPTION) MODELİ ---
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// --- DÖVİZ (EXCHANGE) MODELİ ---
export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: {
    [key: string]: number; // Örn: { "USD": 31.20, "EUR": 33.50 }
  };
}