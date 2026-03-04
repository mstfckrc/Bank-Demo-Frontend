"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileResponse } from "@/types"; // 🚀 V2: CustomerResponse yerine UserProfileResponse
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

  const [editingCustomer, setEditingCustomer] = useState<UserProfileResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 🚀 V2: tcNo yerine identityNumber
  const handleDelete = async (identityNumber: string) => {
    if (confirm("Bu müşteri/kurumu silmek istediğinize emin misiniz?")) {
      await removeCustomer(identityNumber);
    }
  };

  const handleUpdate = async (identityNumber: string, updatedData: { profileName: string; email: string }) => {
    const success = await editCustomer(identityNumber, updatedData);
    if (success) setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      <PageHeader 
        title="Müşteri ve Kurum Yönetimi" 
        description="Sistemdeki tüm bireysel ve kurumsal hesapları görüntüle, onayla ve yönet."
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
                  <TableHead>Ad Soyad / Ünvan</TableHead>
                  <TableHead>Kimlik / Vergi No</TableHead>
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
                    // 🚀 V2: Kimlik kontrolü
                    const isMe = customer.identityNumber === user?.identityNumber;

                    return (
                      <TableRow key={customer.identityNumber}>
                        <TableCell className="font-medium">
                          {/* 🚀 V2: profileName */}
                          {customer.profileName}{" "}
                          {isMe && (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded ml-2">
                              (Sen)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{customer.identityNumber}</TableCell>
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
                          
                          {(customer.status === "PENDING" || customer.status === "REJECTED") && !isMe && (
                            <Button 
                              size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateCustomerStatus && updateCustomerStatus(customer.identityNumber, 'APPROVED')}
                              title="Onayla"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          {(customer.status === "PENDING" || customer.status === "APPROVED") && !isMe && (
                            <Button 
                              size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateCustomerStatus && updateCustomerStatus(customer.identityNumber, 'REJECTED')}
                              title="Reddet / Askıya Al"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {/* 🚀 V2: Dinamik link güncellendi */}
                          <Link href={`/admin/customers/${customer.identityNumber}/accounts`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 cursor-pointer" title="Hesapları Gör">
                              <UserSearch className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost" size="sm"
                            className={`text-orange-600 ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-orange-50"}`}
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsEditModalOpen(true);
                            }}
                            disabled={isMe}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost" size="sm"
                            className={`text-red-600 ${isMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-red-50"}`}
                            onClick={() => handleDelete(customer.identityNumber)}
                            disabled={isMe}
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