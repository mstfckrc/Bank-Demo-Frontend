'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';  
import { useAccounts } from '@/hooks/useAccounts'; // 🚀 KASA MOTORU
import EmployeeModal from '@/components/company/modals/EmployeeModal';
import { CompanyEmployeeResponse, HireEmployeeRequest, UpdateEmployeeRequest } from '@/types';
import { useCompanyEmployees } from '@/hooks/UseCompanyEmployees';

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();
  
  // İşlem Motorundan (Personel) tüm cephaneyi çıkarıyoruz.
  const { 
    employees, 
    loading: empLoading, 
    isProcessing, 
    error: empError, 
    fetchEmployees, 
    removeEmployee, 
    hireEmployee, 
    updateEmployee 
  } = useCompanyEmployees();

  // 🚀 Kasa Motoru (Kurumsal Hesaplar)
  const { 
    accounts, 
    loading: accLoading, 
    fetchAccounts 
  } = useAccounts();
  
  // Modal state'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CompanyEmployeeResponse | null>(null);

  // Sayfa yüklendiğinde hem personelleri hem de kasayı çek
  useEffect(() => {
    fetchEmployees();
    fetchAccounts();
  }, []);

  // --- İŞLEM YÖNETİCİLERİ (HANDLERS) ---

  const handleDelete = async (identityNumber: string, fullName: string) => {
    if (window.confirm(`${fullName} isimli personeli işten çıkarmak (sistemden silmek) istediğinize emin misiniz?`)) {
      await removeEmployee(identityNumber);
    }
  };

  const handleAddNew = () => {
    setSelectedEmployee(null); 
    setIsModalOpen(true);
  };

  const handleEdit = (employee: CompanyEmployeeResponse) => {
    setSelectedEmployee(employee); 
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (data: HireEmployeeRequest | UpdateEmployeeRequest, isEditMode: boolean) => {
    if (isEditMode && selectedEmployee) {
      return await updateEmployee(selectedEmployee.identityNumber, data as UpdateEmployeeRequest);
    } else {
      return await hireEmployee(data as HireEmployeeRequest);
    }
  };

  // --- ARAYÜZ (UI) RENDER ALANI ---

  if (empLoading && employees.length === 0) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Kurumsal veriler yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      
      {/* ÜST BİLGİ PANELİ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kurumsal Yönetim Paneli</h1>
          <p className="text-gray-500 mt-1">Hoş geldiniz, <span className="font-semibold text-blue-600">{user?.profileName}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Toplam Personel</p>
          <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
        </div>
      </div>

      {/* 🚀 YENİ: KURUMSAL KASALAR (HESAPLAR) BÖLÜMÜ */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Kurumsal Hesaplar (Kasa)</h2>
          {/* İleride buraya "Yeni Hesap Aç" butonu koyacağız */}
        </div>
        
        {accLoading ? (
          <div className="text-sm text-gray-500 animate-pulse">Kasalar kontrol ediliyor...</div>
        ) : accounts.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded text-yellow-700 text-sm shadow-sm">
            Şirketinize ait aktif bir banka hesabı bulunmuyor. Maaş ödemeleri için yakında buradan hesap açabileceksiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-lg text-white relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.26-.97-2.32-1.81h-1.7c.07 1.65 1.12 2.88 2.87 3.27V19h2.08v-1.63c1.55-.33 2.88-1.25 2.88-3 0-2.21-1.88-2.92-3.43-3.23z"/></svg>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Bakiye</p>
                <h3 className="text-2xl font-bold mb-4">{acc.balance.toLocaleString('tr-TR')} <span className="text-sm font-normal">{acc.currency}</span></h3>
                <p className="text-slate-300 font-mono text-sm">{acc.iban}</p>
                {!acc.isActive && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">KAPALI</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HATA MESAJI (Varsa) */}
      {empError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          {empError}
        </div>
      )}

      {/* TABLO BÖLÜMÜ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700">Maaş Bordrosu & Çalışanlar</h2>
          <button 
            onClick={handleAddNew}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            + Yeni Personel Ekle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 border-b">TC Kimlik</th>
                <th className="p-4 border-b">Ad Soyad</th>
                <th className="p-4 border-b">Maaş IBAN</th>
                <th className="p-4 border-b text-right">Maaş (TL)</th>
                <th className="p-4 border-b text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Henüz şirketinize kayıtlı bir personel bulunmuyor.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{emp.identityNumber}</td>
                    <td className="p-4 font-medium text-gray-800">{emp.firstName} {emp.lastName}</td>
                    <td className="p-4 text-sm font-mono text-gray-500">{emp.salaryIban}</td>
                    <td className="p-4 text-right font-semibold text-gray-800">
                      {emp.salaryAmount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEdit(emp)}
                        disabled={isProcessing}
                        className="text-blue-500 hover:text-blue-700 font-medium text-sm mr-4 disabled:opacity-50"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.identityNumber, `${emp.firstName} ${emp.lastName}`)}
                        disabled={isProcessing}
                        className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                      >
                        Çıkar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedEmployee={selectedEmployee}
        onSave={handleSaveEmployee}
      />

    </div>
  );
}