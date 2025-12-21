-- ============================================
-- Migration: Criar tabela de notificações
-- Data: 2024-12-21
-- ============================================

-- 1. Criar tipo ENUM para tipos de notificação
DO $$ BEGIN
  CREATE TYPE tipo_notificacao_enum AS ENUM (
    'MATRICULA_APROVADA',
    'MATRICULA_PENDENTE',
    'MATRICULA_REJEITADA',
    'AULA_PROXIMA',
    'CHECKIN_SUCESSO',
    'GRADUACAO_PENDENTE',
    'GRADUACAO_APROVADA',
    'STREAK_ALCANCADO',
    'META_ALCANCADA',
    'SISTEMA'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Criar tabela notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo tipo_notificacao_enum NOT NULL DEFAULT 'SISTEMA',
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  dados_json JSONB,
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario 
  ON notificacoes (usuario_id);

CREATE INDEX IF NOT EXISTS idx_notificacoes_lida 
  ON notificacoes (usuario_id, lida);

CREATE INDEX IF NOT EXISTS idx_notificacoes_criado 
  ON notificacoes (criado_em DESC);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 5. Policy: usuário só vê suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notificacoes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can update own notifications" ON notificacoes
  FOR UPDATE USING (auth.uid() = usuario_id);

-- ============================================
-- Para verificar se funcionou:
-- SELECT * FROM notificacoes LIMIT 5;
-- ============================================
