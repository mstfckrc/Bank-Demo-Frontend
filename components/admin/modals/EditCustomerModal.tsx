// components/admin/modals/EditCustomerModal.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface EditCustomerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any; 
  onUpdate: (tcNo: string, updatedData: { fullName: string; email: string }) => Promise<void>;
}

export function EditCustomerModal({ isOpen, onOpenChange, customer, onUpdate }: EditCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "" });

  // Modal açıldığında form verilerini doldur
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || "",
        email: customer.email || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    try {
      setLoading(true);
      // 🚀 Backend tcNo beklediği için customer.tcNo gönderiyoruz
      await onUpdate(customer.tcNo, formData);
      onOpenChange(false); // Sadece BAŞARILI olursa modalı kapat
    } catch (error) {
      // Hata olursa modal kapanmaz, kullanıcı tekrar deneyebilir
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Müşteri Profilini Düzenle</DialogTitle>
          <DialogDescription>
            {customer?.tcNo} TCKN'li müşterinin bilgilerini güncelliyorsunuz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>E-posta Adresi</Label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}