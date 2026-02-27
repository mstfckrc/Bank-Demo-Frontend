"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { CustomerResponse } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, UserSearch, Settings, CheckCircle2, XCircle } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { EditCustomerModal } from "@/components/admin/modals/EditCustomerModal";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomerListPage() {
  const { user } = useAuthStore();
  const { customers, loading, fetchCustomers, removeCustomer, editCustomer, updateCustomerStatus } = useCustomers();

  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async (tcNo: string) => {
    if (confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      await removeCustomer(tcNo);
    }
  };

  const handleUpdate = async (tcNo: string, updatedData: { fullName: string; email: string }) => {
    const success = await editCustomer(tcNo, updatedData);
    if (success) setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      <PageHeader 
        title="Müşteri Yönetimi" 
        description="Sistemdeki tüm müşterileri görüntüle, onayla ve yönet."
        action={<Button onClick={fetchCustomers} variant="outline" size="sm">Listeyi Yenile</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tüm Kayıtlı Müşteriler</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>TC Kimlik No</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Henüz kayıtlı müşteri bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => {
                    const isMe = customer.tcNo === user?.tcNo;

                    return (
                      <TableRow key={customer.tcNo}>
                        <TableCell className="font-medium">
                          {customer.fullName}{" "}
                          {isMe && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded ml-2">
                              (Sen)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{customer.tcNo}</TableCell>
                        <TableCell>{customer.email}</TableCell>

                        <TableCell>
                          {customer.status === "PENDING" && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Beklemede</Badge>
                          )}
                          {customer.status === "APPROVED" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Onaylı</Badge>
                          )}
                          {customer.status === "REJECTED" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Reddedildi</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right space-x-2">
                          
                          {/* ONAYLA BUTONU (Beklemede veya Reddedilmişse çıkar) */}
                          {(customer.status === "PENDING" || customer.status === "REJECTED") && !isMe && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateCustomerStatus && updateCustomerStatus(customer.tcNo, 'APPROVED')}
                              title="Müşteriyi Onayla"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* REDDET BUTONU (Beklemede veya Onaylıysa çıkar) */}
                          {(customer.status === "PENDING" || customer.status === "APPROVED") && !isMe && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateCustomerStatus && updateCustomerStatus(customer.tcNo, 'REJECTED')}
                              title="Müşteriyi Reddet / Askıya Al"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}

                          <Link href={`/admin/customers/${customer.tcNo}/accounts`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 cursor-pointer" title="Hesapları Gör">
                              <UserSearch className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-orange-600 ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-orange-50"}`}
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsEditModalOpen(true);
                            }}
                            disabled={isMe}
                            title={isMe ? "Kendi profilinizi 'Ayarlar' menüsünden düzenleyin" : "Müşteriyi Düzenle"}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-red-600 ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-red-50"}`}
                            onClick={() => handleDelete(customer.tcNo)}
                            disabled={isMe}
                            title={isMe ? "Kendi hesabınızı silemezsiniz" : "Müşteriyi Sil"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        customer={editingCustomer}
        onUpdate={handleUpdate}
      />
    </div>
  );
}