"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { accountService } from "@/services/account.service";
import { AccountResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Landmark, Plus } from "lucide-react";
import { toast } from "sonner"; 

// Bileşenleri İçe Aktar
import { AdminTransactionHistoryModal } from "@/components/admin/modals/AdminTransactionHistoryModal";
import { OpenAccountModal } from "@/components/admin/modals/OpenAccountModal";
import { CloseAccountModal } from "@/components/admin/modals/CloseAccountModal";
import { AccountTable } from "@/components/admin/tables/AccountTable";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CustomerAccountsPage() {
  const router = useRouter();
  const params = useParams();
  const tcNo = params.tcNo as string;

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State'leri
  const [isOpenAccountModalOpen, setIsOpenAccountModalOpen] = useState(false);
  
  const [accountToClose, setAccountToClose] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  const [historyAccountNo, setHistoryAccountNo] = useState<string | null>(null);
  const [historyAccountId, setHistoryAccountId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (tcNo) fetchAccounts();
  }, [tcNo]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCustomerAccounts(tcNo); 
      setAccounts(data);
    } catch (error) {
      toast.error("Hata", { description: "Müşteri hesapları getirilemedi." });
    } finally {
      setLoading(false);
    }
  };

  const confirmCloseAccount = async () => {
    if (!accountToClose) return;
    setIsClosing(true);

    try {
      await accountService.deleteAccount(accountToClose);
      toast.success("İşlem Başarılı", { description: `${accountToClose} numaralı hesap kapatıldı.` });
      
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc.accountNumber === accountToClose ? { ...acc, isActive: false, active: false } : acc
        )
      );
      setAccountToClose(null); 
    } catch (error: any) {
      toast.error("İşlem Başarısız", { description: error.response?.data?.message || "Hesap kapatılamadı." });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* 🚀 ÜST BAŞLIK ALANI */}
      <PageHeader 
        title="Müşteri Hesapları" 
        description={`TC: ${tcNo} numaralı müşterinin tüm varlıkları.`}
        action={<Button onClick={fetchAccounts} variant="secondary" size="sm">Listeyi Yenile</Button>}
      />

      {/* 🚀 ANA TABLO KARTI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Landmark className="h-5 w-5 text-slate-400" /> Hesap Listesi
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-white border px-3 py-1.5 rounded-full text-slate-600 shadow-sm">
              Toplam {accounts.length} Kayıt
            </span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all" onClick={() => setIsOpenAccountModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Yeni Hesap Aç
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
          ) : (
            // 🚀 TABLO BİLEŞENİNİ BURADA ÇAĞIRIYORUZ
            <AccountTable 
              accounts={accounts}
              onOpenHistory={(accountNo, accountId) => {
                setHistoryAccountNo(accountNo);
                setHistoryAccountId(accountId);
                setIsHistoryOpen(true);
              }}
              onCloseAccount={(accountNo) => setAccountToClose(accountNo)}
            />
          )}
        </CardContent>
      </Card>

      {/* 🚀 MODALLAR YIĞINI */}
      <AdminTransactionHistoryModal
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        accountNumber={historyAccountNo}
        accountId={historyAccountId}
      />

      <OpenAccountModal
        isOpen={isOpenAccountModalOpen}
        onOpenChange={setIsOpenAccountModalOpen}
        tcNo={tcNo}
        onSuccess={(newAccount) => setAccounts((prev) => [...prev, newAccount])}
      />

      <CloseAccountModal 
        accountToClose={accountToClose}
        isClosing={isClosing}
        onClose={() => setAccountToClose(null)}
        onConfirm={confirmCloseAccount}
      />
    </div>
  );
}