import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, Work, Inspection, CompanyData, Employee } from './types';
import {
  supabase,
  mapCompanyFromDB,
  mapCompanyToDB,
  mapWorkFromDB,
  mapWorkToDB,
  mapInspectionFromDB,
  mapInspectionToDB,
  mapEmployeeFromDB,
  mapEmployeeToDB,
  mapCompanyDataFromDB,
  mapCompanyDataToDB
} from './lib/supabase';

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
  deleteCompany: (id: string) => Promise<void>;
  addWork: (work: Omit<Work, 'id' | 'createdAt'>) => Promise<void>;
  updateWork: (id: string, work: Partial<Work>) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;
  addInspection: (inspection: Omit<Inspection, 'id'>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateCompanyData: (data: Partial<CompanyData>) => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
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

  const loadLocalStorageData = () => {
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
  };

  const fetchUserData = async (userId: string) => {
    try {
      // 1. Fetch Company Data
      const { data: compData, error: compDataErr } = await supabase
        .from('company_data')
        .select('*')
        .maybeSingle();

      if (compDataErr) {
        console.warn('Error fetching company data, using default:', compDataErr);
      }

      if (compData) {
        setCompanyData(mapCompanyDataFromDB(compData));
      } else {
        // If none exists, create default for the user in Supabase
        const defaultCompData = { user_id: userId, name: 'OPUS ASSESSORIAS', logo_url: '' };
        const { data: insertedCompData, error: insertErr } = await supabase
          .from('company_data')
          .insert(defaultCompData)
          .select()
          .maybeSingle();
        
        if (insertedCompData) {
          setCompanyData(mapCompanyDataFromDB(insertedCompData));
        } else if (insertErr) {
          console.error('Failed to insert default company data:', insertErr);
        }
      }

      // 2. Fetch Companies
      const { data: cos, error: cosErr } = await supabase
        .from('companies')
        .select('*');
      if (cosErr) console.error('Error fetching companies:', cosErr);
      if (cos) {
        setCompanies(cos.map(mapCompanyFromDB));
      }

      // 3. Fetch Works
      const { data: ws, error: wsErr } = await supabase
        .from('works')
        .select('*');
      if (wsErr) console.error('Error fetching works:', wsErr);
      if (ws) {
        setWorks(ws.map(mapWorkFromDB));
      }

      // 4. Fetch Inspections
      const { data: insps, error: inspsErr } = await supabase
        .from('inspections')
        .select('*');
      if (inspsErr) console.error('Error fetching inspections:', inspsErr);
      if (insps) {
        setInspections(insps.map(mapInspectionFromDB));
      }

      // 5. Fetch Employees
      const { data: emps, error: empsErr } = await supabase
        .from('employees')
        .select('*');
      if (empsErr) console.error('Error fetching employees:', empsErr);
      if (emps) {
        setEmployees(emps.map(mapEmployeeFromDB));
      }

    } catch (err) {
      console.error('General error fetching user data from Supabase:', err);
    }
  };

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email || '' };
        setUser(u);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        setLoading(true);
        await fetchUserData(session.user.id);
        setLoading(false);
      } else {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          const u = JSON.parse(savedUser);
          setUser(u);
          if (u.id !== 'mock-user-id') {
            // Re-fetch or load local storage
            loadLocalStorageData();
          } else {
            loadLocalStorageData();
          }
        } else {
          setUser(null);
          setCompanies([]);
          setWorks([]);
          setInspections([]);
          setEmployees([]);
          setCompanyData({ name: 'OPUS ASSESSORIAS', logoUrl: '' });
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    if (password) {
      // 1. Try real Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // 2. If it fails with "Invalid login credentials", try signing up on-the-fly
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            throw signUpError;
          }
          if (signUpData.user) {
            const newUser = { id: signUpData.user.id, email: signUpData.user.email || email };
            setUser(newUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
            await fetchUserData(signUpData.user.id);
            return;
          }
        }
        throw error;
      }

      if (data.user) {
        const newUser = { id: data.user.id, email: data.user.email || email };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        await fetchUserData(data.user.id);
      }
    } else {
      // Fallback local mock login
      const newUser = { id: 'mock-user-id', email };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      loadLocalStorageData();
    }
  };

  const signUp = async (email: string, password?: string) => {
    if (!password) {
      throw new Error('Uma senha é obrigatória para cadastro.');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
    if (data.user) {
      const newUser = { id: data.user.id, email: data.user.email || email };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await fetchUserData(data.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setCompanies([]);
    setWorks([]);
    setInspections([]);
    setEmployees([]);
    setCompanyData({ name: 'OPUS ASSESSORIAS', logoUrl: '' });
  };

  const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>) => {
    const newId = crypto.randomUUID();
    const newCompany: Company = {
      ...company,
      id: newId,
      createdAt: new Date().toISOString()
    };

    if (user && user.id !== 'mock-user-id') {
      const dbCompany = mapCompanyToDB({ ...newCompany, user_id: user.id });
      const { error } = await supabase.from('companies').insert(dbCompany);
      if (error) {
        console.error('Error saving company to Supabase:', error);
        throw error;
      }
    }

    const updated = [...companies, newCompany];
    setCompanies(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
  };

  const updateCompany = async (id: string, updatedFields: Partial<Company>) => {
    if (user && user.id !== 'mock-user-id') {
      const dbCompany = mapCompanyToDB(updatedFields);
      const { error } = await supabase.from('companies').update(dbCompany).eq('id', id);
      if (error) {
        console.error('Error updating company in Supabase:', error);
        throw error;
      }
    }

    const updated = companies.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCompanies(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
  };

  const deleteCompany = async (id: string) => {
    if (user && user.id !== 'mock-user-id') {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) {
        console.error('Error deleting company from Supabase:', error);
        throw error;
      }
    }

    const updated = companies.filter(c => c.id !== id);
    setCompanies(updated);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(updated));
  };

  const addWork = async (work: Omit<Work, 'id' | 'createdAt'>) => {
    const newId = crypto.randomUUID();
    const newWork: Work = {
      ...work,
      id: newId,
      createdAt: new Date().toISOString()
    };

    if (user && user.id !== 'mock-user-id') {
      const dbWork = mapWorkToDB({ ...newWork, user_id: user.id });
      const { error } = await supabase.from('works').insert(dbWork);
      if (error) {
        console.error('Error saving work to Supabase:', error);
        throw error;
      }
    }

    const updated = [...works, newWork];
    setWorks(updated);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(updated));
  };

  const updateWork = async (id: string, updatedFields: Partial<Work>) => {
    if (user && user.id !== 'mock-user-id') {
      const dbWork = mapWorkToDB(updatedFields);
      const { error } = await supabase.from('works').update(dbWork).eq('id', id);
      if (error) {
        console.error('Error updating work in Supabase:', error);
        throw error;
      }
    }

    const updated = works.map(w => w.id === id ? { ...w, ...updatedFields } : w);
    setWorks(updated);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(updated));
  };

  const deleteWork = async (id: string) => {
    if (user && user.id !== 'mock-user-id') {
      const { error } = await supabase.from('works').delete().eq('id', id);
      if (error) {
        console.error('Error deleting work from Supabase:', error);
        throw error;
      }
    }

    const updated = works.filter(w => w.id !== id);
    setWorks(updated);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(updated));
  };

  const addInspection = async (inspection: Omit<Inspection, 'id'>) => {
    const newId = crypto.randomUUID();
    const newInspection: Inspection = {
      ...inspection,
      id: newId
    };

    if (user && user.id !== 'mock-user-id') {
      const dbInspection = mapInspectionToDB({ ...newInspection, user_id: user.id });
      const { error } = await supabase.from('inspections').insert(dbInspection);
      if (error) {
        console.error('Error saving inspection to Supabase:', error);
        throw error;
      }
    }

    const updated = [...inspections, newInspection];
    setInspections(updated);
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(updated));
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newId = crypto.randomUUID();
    const newEmployee: Employee = {
      ...employee,
      id: newId
    };

    if (user && user.id !== 'mock-user-id') {
      const dbEmployee = mapEmployeeToDB({ ...newEmployee, user_id: user.id });
      const { error } = await supabase.from('employees').insert(dbEmployee);
      if (error) {
        console.error('Error saving employee to Supabase:', error);
        throw error;
      }
    }

    const updated = [...employees, newEmployee];
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  };

  const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    if (user && user.id !== 'mock-user-id') {
      const dbEmployee = mapEmployeeToDB(updatedFields);
      const { error } = await supabase.from('employees').update(dbEmployee).eq('id', id);
      if (error) {
        console.error('Error updating employee in Supabase:', error);
        throw error;
      }
    }

    const updated = employees.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  };

  const deleteEmployee = async (id: string) => {
    if (user && user.id !== 'mock-user-id') {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) {
        console.error('Error deleting employee from Supabase:', error);
        throw error;
      }
    }

    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
  };

  const updateCompanyData = async (data: Partial<CompanyData>) => {
    const updated = { ...companyData, ...data };

    if (user && user.id !== 'mock-user-id') {
      const dbCompData = mapCompanyDataToDB({ ...data, user_id: user.id });
      // Upsert: Try to get existing record
      const { data: existing, error: fetchErr } = await supabase
        .from('company_data')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { error: updateErr } = await supabase
          .from('company_data')
          .update(dbCompData)
          .eq('id', existing.id);
        if (updateErr) console.error('Error updating company data:', updateErr);
      } else {
        const { error: insertErr } = await supabase
          .from('company_data')
          .insert({ ...dbCompData, user_id: user.id });
        if (insertErr) console.error('Error inserting company data:', insertErr);
      }
    }

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
      deleteCompany,
      addWork,
      updateWork,
      deleteWork,
      addInspection,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateCompanyData,
      login,
      signUp,
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
