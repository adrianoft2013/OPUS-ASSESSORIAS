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

const cleanForLocalStorage = <T,>(obj: T): T => {
  if (typeof obj === 'string') {
    if (obj.length > 1000 && obj.startsWith('data:')) {
      return '' as unknown as T;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return obj;
    let changed = false;
    const result = obj.map(item => {
      const cleaned = cleanForLocalStorage(item);
      if (cleaned !== item) changed = true;
      return cleaned;
    });
    return changed ? result as unknown as T : obj;
  }
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    let changed = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (typeof val === 'string') {
          if (val.length > 1000 && val.startsWith('data:')) {
            result[key] = '';
            changed = true;
          } else {
            result[key] = val;
          }
        } else if (val === null || typeof val === 'number' || typeof val === 'boolean') {
          result[key] = val;
        } else {
          const cleaned = cleanForLocalStorage(val);
          result[key] = cleaned;
          if (cleaned !== val) {
            changed = true;
          }
        }
      }
    }
    return changed ? result as T : obj;
  }
  return obj;
};

const safeLocalStorageSet = (key: string, value: any) => {
  try {
    const cleanedValue = cleanForLocalStorage(value);
    const serialized = typeof cleanedValue === 'string' ? cleanedValue : JSON.stringify(cleanedValue);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Could not save key "${key}" to localStorage:`, error);
  }
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
        safeLocalStorageSet(STORAGE_KEYS.USER, u);
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
            safeLocalStorageSet(STORAGE_KEYS.USER, newUser);
            await fetchUserData(signUpData.user.id);
            return;
          }
        }
        throw error;
      }

      if (data.user) {
        const newUser = { id: data.user.id, email: data.user.email || email };
        setUser(newUser);
        safeLocalStorageSet(STORAGE_KEYS.USER, newUser);
        await fetchUserData(data.user.id);
      }
    } else {
      // Fallback local mock login
      const newUser = { id: 'mock-user-id', email };
      setUser(newUser);
      safeLocalStorageSet(STORAGE_KEYS.USER, newUser);
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
      safeLocalStorageSet(STORAGE_KEYS.USER, newUser);
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

    const updated = [...companies, newCompany];
    setCompanies(updated);
    safeLocalStorageSet(STORAGE_KEYS.COMPANIES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbCompany = mapCompanyToDB({ ...newCompany, user_id: user.id });
          const { error } = await supabase.from('companies').insert(dbCompany);
          if (error) {
            console.error('Error saving company to Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for addCompany:', err);
        }
      })();
    }
  };

  const updateCompany = async (id: string, updatedFields: Partial<Company>) => {
    const updated = companies.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCompanies(updated);
    safeLocalStorageSet(STORAGE_KEYS.COMPANIES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbCompany = mapCompanyToDB(updatedFields);
          const { error } = await supabase.from('companies').update(dbCompany).eq('id', id);
          if (error) {
            console.error('Error updating company in Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for updateCompany:', err);
        }
      })();
    }
  };

  const deleteCompany = async (id: string) => {
    const updated = companies.filter(c => c.id !== id);
    setCompanies(updated);
    safeLocalStorageSet(STORAGE_KEYS.COMPANIES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const { error } = await supabase.from('companies').delete().eq('id', id);
          if (error) {
            console.error('Error deleting company from Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for deleteCompany:', err);
        }
      })();
    }
  };

  const addWork = async (work: Omit<Work, 'id' | 'createdAt'>) => {
    const newId = crypto.randomUUID();
    const newWork: Work = {
      ...work,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const updated = [...works, newWork];
    setWorks(updated);
    safeLocalStorageSet(STORAGE_KEYS.WORKS, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbWork = mapWorkToDB({ ...newWork, user_id: user.id });
          const { error } = await supabase.from('works').insert(dbWork);
          if (error) {
            console.error('Error saving work to Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for addWork:', err);
        }
      })();
    }
  };

  const updateWork = async (id: string, updatedFields: Partial<Work>) => {
    const updated = works.map(w => w.id === id ? { ...w, ...updatedFields } : w);
    setWorks(updated);
    safeLocalStorageSet(STORAGE_KEYS.WORKS, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbWork = mapWorkToDB(updatedFields);
          const { error } = await supabase.from('works').update(dbWork).eq('id', id);
          if (error) {
            console.error('Error updating work in Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for updateWork:', err);
        }
      })();
    }
  };

  const deleteWork = async (id: string) => {
    const updated = works.filter(w => w.id !== id);
    setWorks(updated);
    safeLocalStorageSet(STORAGE_KEYS.WORKS, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const { error } = await supabase.from('works').delete().eq('id', id);
          if (error) {
            console.error('Error deleting work from Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for deleteWork:', err);
        }
      })();
    }
  };

  const addInspection = async (inspection: Omit<Inspection, 'id'>) => {
    const newId = crypto.randomUUID();
    const newInspection: Inspection = {
      ...inspection,
      id: newId
    };

    const updated = [...inspections, newInspection];
    setInspections(updated);
    safeLocalStorageSet(STORAGE_KEYS.INSPECTIONS, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbInspection = mapInspectionToDB({ ...newInspection, user_id: user.id });
          const { error } = await supabase.from('inspections').insert(dbInspection);
          if (error) {
            console.error('Error saving inspection to Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for addInspection:', err);
        }
      })();
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newId = crypto.randomUUID();
    const newEmployee: Employee = {
      ...employee,
      id: newId
    };

    const updated = [...employees, newEmployee];
    setEmployees(updated);
    safeLocalStorageSet(STORAGE_KEYS.EMPLOYEES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbEmployee = mapEmployeeToDB({ ...newEmployee, user_id: user.id });
          const { error } = await supabase.from('employees').insert(dbEmployee);
          if (error) {
            console.error('Error saving employee to Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for addEmployee:', err);
        }
      })();
    }
  };

  const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    const updated = employees.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setEmployees(updated);
    safeLocalStorageSet(STORAGE_KEYS.EMPLOYEES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbEmployee = mapEmployeeToDB(updatedFields);
          const { error } = await supabase.from('employees').update(dbEmployee).eq('id', id);
          if (error) {
            console.error('Error updating employee in Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for updateEmployee:', err);
        }
      })();
    }
  };

  const deleteEmployee = async (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    safeLocalStorageSet(STORAGE_KEYS.EMPLOYEES, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const { error } = await supabase.from('employees').delete().eq('id', id);
          if (error) {
            console.error('Error deleting employee from Supabase in background:', error);
          }
        } catch (err) {
          console.error('Failed background sync for deleteEmployee:', err);
        }
      })();
    }
  };

  const updateCompanyData = async (data: Partial<CompanyData>) => {
    const updated = { ...companyData, ...data };
    setCompanyData(updated);
    safeLocalStorageSet(STORAGE_KEYS.COMPANY_DATA, updated);

    if (user && user.id !== 'mock-user-id') {
      (async () => {
        try {
          const dbCompData = mapCompanyDataToDB({ ...data, user_id: user.id });
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
        } catch (err) {
          console.error('Failed background sync for updateCompanyData:', err);
        }
      })();
    }
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
