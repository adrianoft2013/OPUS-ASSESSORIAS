-- =========================================================================
-- MIGRAÇÃO DE ATUALIZAÇÃO DA TABELA: employees (Funcionários)
-- Adiciona colunas para Ordem de Serviço, Ficha de Registro e Contrato de Trabalho
-- =========================================================================

-- Adiciona as colunas de controle caso elas ainda não existam no banco de dados ativo
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS service_order TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS registration_record TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employment_contract TEXT;

-- Comentários explicativos para documentar o propósito das colunas no Supabase
COMMENT ON COLUMN public.employees.service_order IS 'Ordem de Serviço (Conforme / Não Conforme). Documento anexado em "documents" com o tipo "Ordem de Serviço".';
COMMENT ON COLUMN public.employees.registration_record IS 'Ficha de Registro (Conforme / Não Conforme). Documento anexado em "documents" com o tipo "Ficha de Registro".';
COMMENT ON COLUMN public.employees.employment_contract IS 'Contrato de Trabalho (Conforme / Não Conforme). Documento anexado em "documents" com o tipo "Contrato de Trabalho".';
