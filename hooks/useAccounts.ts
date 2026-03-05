import { useState, useEffect } from "react";
import { accountService } from "@/services/account.service";
import { adminService } from "@/services/admin.service";
import { AccountResponse } from "@/types";
import { toast } from "sonner";

// 🚀 V2: tcNo yerine identityNumber bekliyoruz
export function useAccounts(identityNumber?: string) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [identityNumber]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      // 🚀 DÜZELTME: Eğer kimlik numarası yoksa, admin rotasına değil,
      // müşterinin kendi hesaplarını getiren (getMyAccounts) rotaya git!
      const data = identityNumber 
        ? await adminService.getCustomerAccounts(identityNumber) 
        : await accountService.getMyAccounts(); // <-- HAYAT KURTARAN DOKUNUŞ
        
      setAccounts(data);
    } catch (error) {
      console.error("Hesaplar çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeAccount = async (accountNumber: string) => {
    try {
      setIsProcessing(true);
      await accountService.deleteAccount(accountNumber);
      toast.success("İşlem Başarılı", { description: `${accountNumber} numaralı hesap kapatıldı.` });
      
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.accountNumber === accountNumber ? { ...acc, isActive: false } : acc
        )
      );
      return true; 
    } finally {
      setIsProcessing(false);
    }
  };

  // 🚀 V2: Müşterinin identityNumber bilgisini yolluyoruz
  const openAccount = async (customerIdentityNumber: string, currency: string) => {
    try {
      setIsProcessing(true);
      const newAccount = await adminService.openAccountForCustomer(customerIdentityNumber, currency);
      toast.success("Hesap Başarıyla Açıldı", { description: `${newAccount.iban} numaralı ${newAccount.currency} hesabı oluşturuldu.` });
      setAccounts((prev) => [...prev, newAccount]);
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  return { accounts, loading, isProcessing, fetchAccounts, closeAccount, openAccount };
}