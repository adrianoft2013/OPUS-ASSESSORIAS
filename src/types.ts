export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  uf: string;
  createdAt: string;
}

export interface Work {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  responsible: string;
  phone: string;
  city: string;
  uf: string;
  subcontractorIds?: string[];
}

export interface Evidence {
  id: string;
  description: string;
  photoUrl?: string;
  fileName?: string;
}

export interface Inspection {
  id: string;
  workId: string;
  workName: string;
  companyId: string;
  companyName: string;
  date: string;
  status: 'conformity' | 'non-conformity';
  evidences: Evidence[];
  city: string;
  uf: string;
}

export interface EmployeeDocument {
  type: string;
  dueDate: string;
  fileUrl?: string;
  fileName?: string;
  status?: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  role: string;
  companyId: string;
  companyName: string;
  workId: string;
  workName: string;
  status: 'active' | 'inactive';
  documents: EmployeeDocument[];
  isContractor?: boolean;
  contractorName?: string;
  serviceOrder?: string;
  registrationRecord?: string;
  employmentContract?: string;
  esocial?: string;
}

export interface CompanyData {
  logoUrl?: string;
  name: string;
}

export interface SubcontractorDocument {
  status: 'C' | 'N/C' | 'N/A';
  dueDate?: string;
  date?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  uf: string;
  createdAt: string;
  documents?: {
    [key: string]: SubcontractorDocument;
  };
}
