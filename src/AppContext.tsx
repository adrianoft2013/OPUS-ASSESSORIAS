import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Work, Inspection, CompanyData, Employee } from './types';

interface User {
  id: string;
  email: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  companies: Company[];
  works: Work[];
  inspections: Inspection[];
  employees: Employee[];
  companyData: CompanyData;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  addWork: (work: Omit<Work, 'id' | 'createdAt'>) => Promise<void>;
  updateWork: (id: string, work: Partial<Work>) => Promise<void>;
  addInspection: (inspection: Omit<Inspection, 'id'>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  updateCompanyData: (data: Partial<CompanyData>) => Promise<void>;
  login: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPANIES: 'opus_companies',
  WORKS: 'opus_works',
  INSPECTIONS: 'opus_inspections',
  EMPLOYEES: 'opus_employees',
  COMPANY_DATA: 'opus_company_data',
  USER: 'opus_user'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData>({ 
    name: 'OPUS ASSESSORIAS',
    logoUrl: '' 
  });

  useEffect(() => {
    // Load data from localStorage
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));

    const savedWorks = localStorage.getItem(STORAGE_KEYS.WORKS);
    if (savedWorks) setWorks(JSON.parse(savedWorks));

    const savedInspections = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
    if (savedInspections) setInspections(JSON.parse(savedInspections));

    const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));

    const savedCompanyData = localStorage.getItem(STORAGE_KEYS.COMPANY_DATA);
    if (savedCompanyData) setCompanyData(JSON.parse(savedCompanyData));

    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const newUser = { id: 'mock-user-id', email };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = {
      ...company,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const updated = [...companies, newCompany];
    setCompanies(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
  };

  const updateCompany = async (id: string, updatedFields: Partial<Company>) => {
    const updated = companies.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCompanies(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
  };

  const addWork = async (work: Omit<Work, 'id' | 'createdAt'>) => {
    const newWork: Work = {
      ...work,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const updated = [...works, newWork];
    setWorks(updated);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(updated));
  };

  const updateWork = async (id: string, updatedFields: Partial<Work>) => {
    const updated = works.map(w => w.id === id ? { ...w, ...updatedFields } : w);
    setWorks(updated);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(updated));
  };

  const addInspection = async (inspection: Omit<Inspection, 'id'>) => {
    const newInspection: Inspection = {
      ...inspection,
      id: crypto.randomUUID()
    };
    const updated = [...inspections, newInspection];
    setInspections(updated);
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(updated));
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID()
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  };

  const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    const updated = employees.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  };

  const updateCompanyData = async (data: Partial<CompanyData>) => {
    const updated = { ...companyData, ...data };
    setCompanyData(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANY_DATA, JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      companies,
      works,
      inspections,
      employees,
      companyData,
      addCompany,
      updateCompany,
      addWork,
      updateWork,
      addInspection,
      addEmployee,
      updateEmployee,
      updateCompanyData,
      login,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
