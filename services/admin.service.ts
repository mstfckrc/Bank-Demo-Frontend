import { TransactionResponse, CustomerResponse, AccountResponse } from "@/types";
import api from "../lib/axios";

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export const adminService = {
  // --- MÜŞTERİ YÖNETİMİ ---

  // Tüm müşterileri listele
  getAllCustomers: async (): Promise<CustomerResponse[]> => {
    const response = await api.get<CustomerResponse[]>('/admin/customers');
    return response.data;
  },

  // Müşteri bilgilerini güncelle
  updateCustomer: async (tcNo: string, data: UpdateProfileRequest) => {
    const response = await api.put(`/admin/customers/${tcNo}`, data);
    return response.data; // Backend'den dönen güncel CustomerResponse
  },

  // Müşteri Onay/Red Durum Güncelleme
  updateCustomerStatus: async (tcNo: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const response = await api.put(`/admin/customers/${tcNo}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Müşteriyi sil
  deleteCustomer: async (tcNo: string): Promise<void> => {
    await api.delete(`/admin/customers/${tcNo}`);
  },


  // --- HESAP YÖNETİMİ ---

  // Müşteriye ait tüm hesapları getirme
  getCustomerAccounts: async (tcNo: string): Promise<AccountResponse[]> => {
    const response = await api.get<AccountResponse[]>(`/admin/customers/${tcNo}/accounts`);
    return response.data;
  },

  // Admin yetkisiyle müşteriye yeni hesap açma
  openAccountForCustomer: async (tcNo: string, currency: string) => {
    const response = await api.post(`/admin/customers/${tcNo}/accounts`, { currency });
    return response.data;
  },

  // Admin için belirli bir hesabın hareketlerini getir
  getAccountTransactions: async (accountNumber: string): Promise<TransactionResponse[]> => {
    const response = await api.get<TransactionResponse[]>(`/admin/accounts/${accountNumber}/transactions`);
    return response.data;
  },

  // Tüm banka trafiğini getir
  getAllTransactions: async (status?: string): Promise<TransactionResponse[]> => {
    const response = await api.get<TransactionResponse[]>('/admin/transactions', {
      params: { status }
    });
    return response.data;
  },

  // Bekleyen işlemi ONAYLA
  approveTransaction: async (referenceNo: string): Promise<TransactionResponse> => {
    const response = await api.put(`/admin/transactions/${referenceNo}/approve`);
    return response.data;
  },

  // Bekleyen işlemi REDDET ve iade et
  rejectTransaction: async (referenceNo: string): Promise<TransactionResponse> => {
    const response = await api.put(`/admin/transactions/${referenceNo}/reject`);
    return response.data;
  }
};