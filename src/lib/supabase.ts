import { createClient } from '@supabase/supabase-js';
import { Company, Work, Inspection, Employee, CompanyData } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nppqkdkhypeqeluweava.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aesIKA2xHnJxFWYN3MykKg_vzEFlFL-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================================
// MAPPERS: Database (snake_case) <-> Frontend (camelCase)
// =========================================================================

export const mapCompanyFromDB = (db: any): Company => ({
  id: db.id,
  name: db.name,
  cnpj: db.cnpj || '',
  address: db.address || '',
  phone: db.phone || '',
  contactName: db.contact_name || '',
  contactPhone: db.contact_phone || '',
  contactEmail: db.contact_email || '',
  city: db.city || '',
  uf: db.uf || '',
  createdAt: db.created_at || new Date().toISOString()
});

export const mapCompanyToDB = (company: Partial<Company> & { user_id?: string }) => {
  const db: any = {};
  if (company.id) db.id = company.id;
  if (company.user_id) db.user_id = company.user_id;
  if (company.name !== undefined) db.name = company.name;
  if (company.cnpj !== undefined) db.cnpj = company.cnpj;
  if (company.address !== undefined) db.address = company.address;
  if (company.phone !== undefined) db.phone = company.phone;
  if (company.contactName !== undefined) db.contact_name = company.contactName;
  if (company.contactPhone !== undefined) db.contact_phone = company.contactPhone;
  if (company.contactEmail !== undefined) db.contact_email = company.contactEmail;
  if (company.city !== undefined) db.city = company.city;
  if (company.uf !== undefined) db.uf = company.uf;
  return db;
};

export const mapWorkFromDB = (db: any): Work => ({
  id: db.id,
  name: db.name,
  companyId: db.company_id,
  companyName: db.company_name || '',
  createdAt: db.created_at || new Date().toISOString(),
  responsible: db.responsible || '',
  phone: db.phone || '',
  city: db.city || '',
  uf: db.uf || ''
});

export const mapWorkToDB = (work: Partial<Work> & { user_id?: string }) => {
  const db: any = {};
  if (work.id) db.id = work.id;
  if (work.user_id) db.user_id = work.user_id;
  if (work.companyId !== undefined) db.company_id = work.companyId;
  if (work.name !== undefined) db.name = work.name;
  if (work.companyName !== undefined) db.company_name = work.companyName;
  if (work.responsible !== undefined) db.responsible = work.responsible;
  if (work.phone !== undefined) db.phone = work.phone;
  if (work.city !== undefined) db.city = work.city;
  if (work.uf !== undefined) db.uf = work.uf;
  return db;
};

export const mapInspectionFromDB = (db: any): Inspection => ({
  id: db.id,
  workId: db.work_id,
  workName: db.work_name || '',
  companyId: db.company_id,
  companyName: db.company_name || '',
  date: db.date || new Date().toISOString().split('T')[0],
  status: db.status as 'conformity' | 'non-conformity',
  evidences: Array.isArray(db.evidences) ? db.evidences : [],
  city: db.city || '',
  uf: db.uf || ''
});

export const mapInspectionToDB = (inspection: Partial<Inspection> & { user_id?: string }) => {
  const db: any = {};
  if (inspection.id) db.id = inspection.id;
  if (inspection.user_id) db.user_id = inspection.user_id;
  if (inspection.workId !== undefined) db.work_id = inspection.workId;
  if (inspection.companyId !== undefined) db.company_id = inspection.companyId;
  if (inspection.workName !== undefined) db.work_name = inspection.workName;
  if (inspection.companyName !== undefined) db.company_name = inspection.companyName;
  if (inspection.date !== undefined) db.date = inspection.date;
  if (inspection.status !== undefined) db.status = inspection.status;
  if (inspection.evidences !== undefined) db.evidences = inspection.evidences;
  if (inspection.city !== undefined) db.city = inspection.city;
  if (inspection.uf !== undefined) db.uf = inspection.uf;
  return db;
};

export const mapEmployeeFromDB = (db: any): Employee => ({
  id: db.id,
  name: db.name,
  cpf: db.cpf,
  role: db.role || '',
  companyId: db.company_id || '',
  companyName: db.company_name || '',
  workId: db.work_id || '',
  workName: db.work_name || '',
  status: (db.status || 'active') as 'active' | 'inactive',
  documents: Array.isArray(db.documents) ? db.documents : [],
  isContractor: db.is_contractor ?? false,
  contractorName: db.contractor_name || '',
  serviceOrder: db.service_order || '',
  registrationRecord: db.registration_record || ''
});

export const mapEmployeeToDB = (employee: Partial<Employee> & { user_id?: string }) => {
  const db: any = {};
  if (employee.id) db.id = employee.id;
  if (employee.user_id) db.user_id = employee.user_id;
  if (employee.companyId !== undefined) db.company_id = employee.companyId || null;
  if (employee.workId !== undefined) db.work_id = employee.workId || null;
  if (employee.name !== undefined) db.name = employee.name;
  if (employee.cpf !== undefined) db.cpf = employee.cpf;
  if (employee.role !== undefined) db.role = employee.role;
  if (employee.companyName !== undefined) db.company_name = employee.companyName;
  if (employee.workName !== undefined) db.work_name = employee.workName;
  if (employee.status !== undefined) db.status = employee.status;
  if (employee.documents !== undefined) db.documents = employee.documents;
  if (employee.isContractor !== undefined) db.is_contractor = employee.isContractor;
  if (employee.contractorName !== undefined) db.contractor_name = employee.contractorName;
  if (employee.serviceOrder !== undefined) db.service_order = employee.serviceOrder;
  if (employee.registrationRecord !== undefined) db.registration_record = employee.registrationRecord;
  return db;
};

export const mapCompanyDataFromDB = (db: any): CompanyData => ({
  name: db.name || 'OPUS ASSESSORIAS',
  logoUrl: db.logo_url || ''
});

export const mapCompanyDataToDB = (data: Partial<CompanyData> & { user_id?: string }) => {
  const db: any = {};
  if (data.user_id) db.user_id = data.user_id;
  if (data.name !== undefined) db.name = data.name;
  if (data.logoUrl !== undefined) db.logo_url = data.logoUrl;
  return db;
};
