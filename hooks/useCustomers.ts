import { useState, useEffect } from "react";
// 🚀 GÜNCELLEME: customerService importunu sildik, sadece adminService kaldı
import { adminService } from "@/services/admin.service";
import { CustomerResponse } from "@/types";
import { toast } from "sonner";

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // 🚀 GÜNCELLEME: customerService yerine adminService kullanıyoruz
      const data = await adminService.getAllCustomers();
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  const removeCustomer = async (tcNo: string) => {
    // Interceptor sayesinde try-catch'e gerek yok
    // 🚀 GÜNCELLEME: customerService yerine adminService kullanıyoruz
    await adminService.deleteCustomer(tcNo);
    setCustomers((prev) => prev.filter((c) => c.tcNo !== tcNo));
    toast.success("Müşteri başarıyla silindi.");
  };

  const editCustomer = async (tcNo: string, updatedData: { fullName: string; email: string }) => {
    // Backend'e at, dönerse state'i güncelle
    const updatedCustomer = await adminService.updateCustomer(tcNo, updatedData);
    toast.success("Müşteri bilgileri başarıyla güncellendi!");
    setCustomers((prev) => prev.map((c) => (c.tcNo === tcNo ? { ...c, ...updatedCustomer } : c)));
    return true; // Modal'ın kapanması için UI'a "başarılı" sinyali dönüyoruz
  };

  // Müşteri Onay/Red İşlemi (Burası zaten adminService kullanıyordu, kusursuz)
  const updateCustomerStatus = async (tcNo: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      // 1. Servise isteği at
      await adminService.updateCustomerStatus(tcNo, status);
      
      // 2. Başarılı mesajı göster
      toast.success(`Müşteri başarıyla ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`);
      
      // 3. Tablodaki verilerin güncel halini tekrar çek (Sayfayı yenilemeye gerek kalmadan)
      await fetchCustomers();
      
      return true;
    } catch (error: any) {
      toast.error("İşlem gerçekleştirilemedi!", { 
        description: error.response?.data?.message || "Bilinmeyen bir hata oluştu." 
      });
      return false;
    }
  };

  return { customers, loading, fetchCustomers, removeCustomer, editCustomer, updateCustomerStatus };
}