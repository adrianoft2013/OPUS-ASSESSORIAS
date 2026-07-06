-- =========================================================================
-- MIGRAÇÃO DE ADIÇÃO DE COLUNA DE DOCUMENTOS ÀS TERCEIRIZADAS
-- Nome do Projeto: OpusAssessorias
-- Data: 2026-07-03
-- Objetivo: Adicionar coluna documents (JSONB) na tabela subcontractors
-- =========================================================================

ALTER TABLE public.subcontractors ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.subcontractors.documents IS 'Dicionário contendo os documentos PGR, PCMSO, CIPA, etc., de controle de conformidade da terceirizada.';
