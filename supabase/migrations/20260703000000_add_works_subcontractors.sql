-- =========================================================================
-- MIGRAÇÃO DE ADIÇÃO DE TERCEIRIZADAS E ASSOCIAÇÃO ÀS OBRAS
-- Nome do Projeto: OpusAssessorias
-- Data: 2026-07-03
-- Objetivo: Criar a tabela de terceirizadas (subcontractors) caso não exista e 
--            adicionar a coluna de relacionamento subcontractor_ids na tabela works.
-- =========================================================================

-- 1. TABELA: subcontractors (Terceirizadas)
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

-- Garantir RLS ativado
ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;

-- Políticas para subcontractors
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias terceirizadas" ON public.subcontractors;
CREATE POLICY "Usuários podem gerenciar suas próprias terceirizadas" 
    ON public.subcontractors 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Índices de busca rápidos
CREATE INDEX IF NOT EXISTS idx_subcontractors_user_id ON public.subcontractors(user_id);

-- Trigger de atualização de updated_at para subcontractors
DROP TRIGGER IF EXISTS update_subcontractors_updated_at ON public.subcontractors;
CREATE TRIGGER update_subcontractors_updated_at
    BEFORE UPDATE ON public.subcontractors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. ALTERAÇÃO DA TABELA: works (Obras)
-- Adiciona a coluna subcontractor_ids como JSONB para armazenar a lista de IDs das terceirizadas vinculadas
ALTER TABLE public.works ADD COLUMN IF NOT EXISTS subcontractor_ids JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.works.subcontractor_ids IS 'Lista de IDs de terceirizadas (subcontractors) vinculadas a esta obra.';
