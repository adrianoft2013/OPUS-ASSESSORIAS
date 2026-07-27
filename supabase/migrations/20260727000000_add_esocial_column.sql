-- =========================================================================
-- MIGRAÇÃO PARA ADICIONAR A COLUNA e-Social NA TABELA DE FUNCIONÁRIOS (SEM PERDA DE DADOS)
-- Data: 2026-07-27
-- =========================================================================

-- Adiciona a coluna esocial na tabela employees com segurança se ela não existir
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS esocial TEXT;

-- Comentário explicativo da coluna
COMMENT ON COLUMN public.employees.esocial IS 'e-Social (Conforme / Não Conforme / N/A ou texto livre).';
