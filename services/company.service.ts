import api from '../lib/axios';
import { 
  CompanyEmployeeResponse, 
  HireEmployeeRequest, 
  UpdateEmployeeRequest 
} from '../types';

// 🚀 DÜZELTME: /api/v1 kısmını sildik, çünkü axios instance'ında zaten tanımlı.
const BASE_URL = '/companies/employees';

export const companyService = {
  
  // 1. Kurumsal yöneticinin kendi çalışanlarını getirir
  getMyEmployees: async (): Promise<CompanyEmployeeResponse[]> => {
    // Gidecek adres: http://localhost:8080/api/v1/companies/employees
    const response = await api.get(BASE_URL);
    return response.data;
  },

  // 2. Yeni personel işe alım talebi atar
  hireEmployee: async (data: HireEmployeeRequest): Promise<CompanyEmployeeResponse> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // 3. Mevcut personelin maaşını veya IBAN'ını günceller
  updateEmployee: async (
    employeeIdentityNumber: string, 
    data: UpdateEmployeeRequest
  ): Promise<CompanyEmployeeResponse> => {
    const response = await api.put(`${BASE_URL}/${employeeIdentityNumber}`, data);
    return response.data;
  },

  // 4. Personeli işten çıkarır
  removeEmployee: async (employeeIdentityNumber: string): Promise<{ message: string }> => {
    const response = await api.delete(`${BASE_URL}/${employeeIdentityNumber}`);
    return response.data;
  }
  
};