import { useState, useEffect } from "react";
import { accountService } from "@/services/account.service";
import { adminService } from "@/services/admin.service";
import { AccountResponse } from "@/types";
import { toast } from "sonner";

// tcNo parametresi opsiyoneldir. Verirsek sadece o müşterinin, vermezsek tüm sistemin hesaplarını çeker.
export function useAccounts(tcNo?: string) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [tcNo]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = tcNo 
        ? await adminService.getCustomerAccounts(tcNo) 
        : await accountService.getAllAccounts();
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  };

  const closeAccount = async (accountNumber: string) => {
    try {
      setIsProcessing(true);
      await accountService.deleteAccount(accountNumber);
      toast.success("İşlem Başarılı", { description: `${accountNumber} numaralı hesap kapatıldı.` });
      
      // Tabloyu anında güncelle
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.accountNumber === accountNumber ? { ...acc, isActive: false, active: false } : acc
        )
      );
      return true; 
    } finally {
      setIsProcessing(false);
    }
  };

  const openAccount = async (customerTcNo: string, currency: string) => {
    try {
      setIsProcessing(true);
      const newAccount = await adminService.openAccountForCustomer(customerTcNo, currency);
      toast.success("Hesap Başarıyla Açıldı", { description: `${newAccount.iban} numaralı ${newAccount.currency} hesabı oluşturuldu.` });
      setAccounts((prev) => [...prev, newAccount]);
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  return { accounts, loading, isProcessing, fetchAccounts, closeAccount, openAccount };
}