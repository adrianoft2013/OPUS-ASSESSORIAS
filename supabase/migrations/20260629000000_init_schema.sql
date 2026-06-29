-- Migration para Inicialização do Banco de Dados no Supabase (PostgreSQL)
-- Nome do Projeto: OpusAssessorias
-- Data de Criação: 2026-06-29

-- =========================================================================
-- 1. FUNÇÃO AUXILIAR PARA ATUALIZAR O CAMPO updated_at AUTOMATICAMENTE
-- =========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================================
-- 2. TABELA: companies (Empresas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    address TEXT,
    phone TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    city TEXT,
    uf TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Triggers de data de atualização
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 3. TABELA: works (Obras)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT, -- Desnormalizado para compatibilidade ou caching rápido
    responsible TEXT,
    phone TEXT,
    city TEXT,
    uf TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Triggers de data de atualização
CREATE TRIGGER update_works_updated_at
    BEFORE UPDATE ON public.works
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 4. TABELA: inspections (Inspeções / Fiscalizações)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    work_name TEXT,
    company_name TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('conformity', 'non-conformity')),
    evidences JSONB NOT NULL DEFAULT '[]'::jsonb, -- Armazena a lista de evidências [{id, description, photoUrl, fileName}]
    city TEXT,
    uf TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Triggers de data de atualização
CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 5. TABELA: employees (Funcionários)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    work_id UUID REFERENCES public.works(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL,
    role TEXT,
    company_name TEXT,
    work_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    documents JSONB NOT NULL DEFAULT '[]'::jsonb, -- Armazena [{type, dueDate, fileUrl, fileName}]
    is_contractor BOOLEAN NOT NULL DEFAULT FALSE,
    contractor_name TEXT,
    service_order TEXT,
    registration_record TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Triggers de data de atualização
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 6. TABELA: company_data (Configurações Gerais de Logo/Nome da Empresa)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.company_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL DEFAULT 'OPUS ASSESSORIAS',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Triggers de data de atualização
CREATE TRIGGER update_company_data_updated_at
    BEFORE UPDATE ON public.company_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =========================================================================
-- 7. POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- =========================================================================

-- Políticas para companies
CREATE POLICY "Usuários podem gerenciar suas próprias empresas" 
    ON public.companies 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para works
CREATE POLICY "Usuários podem gerenciar suas próprias obras" 
    ON public.works 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para inspections
CREATE POLICY "Usuários podem gerenciar suas próprias inspeções" 
    ON public.inspections 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para employees
CREATE POLICY "Usuários podem gerenciar seus próprios funcionários" 
    ON public.employees 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para company_data
CREATE POLICY "Usuários podem gerenciar seus próprios dados corporativos" 
    ON public.company_data 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- 8. CRIAÇÃO DE ÍNDICES PARA OTIMIZAÇÃO DE BUSCAS E JOINS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_works_user_id ON public.works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_company_id ON public.works(company_id);
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_work_id ON public.inspections(work_id);
CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON public.inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_work_id ON public.employees(work_id);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON public.employees(cpf);
