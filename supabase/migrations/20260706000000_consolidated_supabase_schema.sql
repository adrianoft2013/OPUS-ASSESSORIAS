-- =========================================================================
-- MIGRAÇÃO CONSOLIDADA E SEGURA PARA O SUPABASE (SEM PERDA DE DADOS)
-- Nome do Projeto: OpusAssessorias
-- Data de Criação: 2026-07-06
--
-- INSTRUÇÕES:
-- Copie todo o conteúdo deste arquivo e cole no SQL Editor do seu projeto Supabase.
-- Em seguida, clique em "Run" para criar/atualizar a estrutura sem apagar nenhum dado existente.
-- =========================================================================

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
-- 2. TABELA: companies (Construtoras)
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

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 3. TABELA: subcontractors (Terceirizadas)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.subcontractors (
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

-- Adicionar coluna documents de forma segura caso ainda não exista
ALTER TABLE public.subcontractors ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_subcontractors_updated_at ON public.subcontractors;
CREATE TRIGGER update_subcontractors_updated_at
    BEFORE UPDATE ON public.subcontractors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentário explicativo
COMMENT ON COLUMN public.subcontractors.documents IS 'Documentos PGR, PCMSO, CIPA, etc., de controle de conformidade da terceirizada.';

-- =========================================================================
-- 4. TABELA: works (Obras)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    responsible TEXT,
    phone TEXT,
    city TEXT,
    uf TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Adicionar coluna subcontractor_ids de forma segura caso ainda não exista
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS subcontractor_ids JSONB DEFAULT '[]'::jsonb;

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_works_updated_at ON public.works;
CREATE TRIGGER update_works_updated_at
    BEFORE UPDATE ON public.works
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentário explicativo
COMMENT ON COLUMN public.works.subcontractor_ids IS 'Lista de IDs de terceirizadas (subcontractors) vinculadas a esta obra.';

-- =========================================================================
-- 5. TABELA: inspections (Vistorias)
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
    evidences JSONB NOT NULL DEFAULT '[]'::jsonb,
    city TEXT,
    uf TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 6. TABELA: employees (Funcionários)
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
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_contractor BOOLEAN NOT NULL DEFAULT FALSE,
    contractor_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Adicionar colunas adicionais de controle de forma segura caso ainda não existam no banco de dados ativo
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS service_order TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS registration_record TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employment_contract TEXT;

-- Comentários explicativos para documentar o propósito das colunas no Supabase
COMMENT ON COLUMN public.employees.service_order IS 'Ordem de Serviço (Conforme / Não Conforme / N/C).';
COMMENT ON COLUMN public.employees.registration_record IS 'Ficha de Registro (Conforme / Não Conforme / N/C).';
COMMENT ON COLUMN public.employees.employment_contract IS 'Contrato de Trabalho (Conforme / Não Conforme / N/C).';

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 7. TABELA: company_data (Configurações Gerais de Logo/Nome da Empresa)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.company_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL DEFAULT 'OPUS ASSESSORIAS',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Garantir Row Level Security (RLS) habilitado
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_company_data_updated_at ON public.company_data;
CREATE TRIGGER update_company_data_updated_at
    BEFORE UPDATE ON public.company_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =========================================================================
-- 8. POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- =========================================================================

-- Políticas para companies
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias empresas" ON public.companies;
CREATE POLICY "Usuários podem gerenciar suas próprias empresas" 
    ON public.companies 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para subcontractors
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias terceirizadas" ON public.subcontractors;
CREATE POLICY "Usuários podem gerenciar suas próprias terceirizadas" 
    ON public.subcontractors 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para works
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias obras" ON public.works;
CREATE POLICY "Usuários podem gerenciar suas próprias obras" 
    ON public.works 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para inspections
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias inspeções" ON public.inspections;
CREATE POLICY "Usuários podem gerenciar suas próprias inspeções" 
    ON public.inspections 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para employees
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios funcionários" ON public.employees;
CREATE POLICY "Usuários podem gerenciar seus próprios funcionários" 
    ON public.employees 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Políticas para company_data
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios dados corporativos" ON public.company_data;
CREATE POLICY "Usuários podem gerenciar seus próprios dados corporativos" 
    ON public.company_data 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =========================================================================
-- 9. CRIAÇÃO DE ÍNDICES PARA OTIMIZAÇÃO DE BUSCAS E JOINS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_user_id ON public.subcontractors(user_id);
CREATE INDEX IF NOT EXISTS idx_works_user_id ON public.works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_company_id ON public.works(company_id);
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_work_id ON public.inspections(work_id);
CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON public.inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_work_id ON public.employees(work_id);
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON public.employees(cpf);
