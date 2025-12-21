-- ============================================
-- Seed: Notificações de teste
-- Data: 2024-12-21
-- ============================================

-- Inserir notificações para os usuários de teste
-- Buscar IDs dos usuários pelo email

DO $$
DECLARE
  v_aluno_id UUID;
  v_professor_id UUID;
  v_bruno_id UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO v_aluno_id FROM usuarios WHERE email = 'aluno.seed@example.com';
  SELECT id INTO v_professor_id FROM usuarios WHERE email = 'professor.seed@example.com';
  SELECT id INTO v_bruno_id FROM usuarios WHERE email = 'brunoafranca97@gmail.com';

  -- =====================
  -- Notificações do ALUNO
  -- =====================
  IF v_aluno_id IS NOT NULL THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, lida, criado_em) VALUES
      (v_aluno_id, 'MATRICULA_APROVADA', 'Matrícula aprovada!', 'Sua matrícula foi aprovada. Você já pode fazer check-in nas aulas.', false, NOW() - INTERVAL '1 hour'),
      (v_aluno_id, 'AULA_PROXIMA', 'Aula em breve: Jiu-Jitsu Adulto', 'Sua aula começa às 19:30. Não se atrase!', false, NOW() - INTERVAL '2 hours'),
      (v_aluno_id, 'STREAK_ALCANCADO', '🔥 3 semanas consecutivas!', 'Parabéns! Você está treinando há 3 semanas sem faltar. Continue assim!', false, NOW() - INTERVAL '1 day'),
      (v_aluno_id, 'CHECKIN_SUCESSO', 'Check-in confirmado', 'Presença registrada na aula de Jiu-Jitsu Adulto.', true, NOW() - INTERVAL '2 days'),
      (v_aluno_id, 'META_ALCANCADA', '🏆 Meta atingida!', 'Você completou 10 treinos este mês. Excelente dedicação!', true, NOW() - INTERVAL '5 days');
    RAISE NOTICE 'Notificações do aluno.seed inseridas';
  END IF;

  -- ========================
  -- Notificações do PROFESSOR
  -- ========================
  IF v_professor_id IS NOT NULL THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, lida, criado_em) VALUES
      (v_professor_id, 'SISTEMA', 'Novo aluno matriculado', 'João Silva se matriculou na turma Adulto Gi.', false, NOW() - INTERVAL '30 minutes'),
      (v_professor_id, 'GRADUACAO_PENDENTE', 'Graduação pendente', 'Aluno Carlos Santos está apto para promoção de faixa.', false, NOW() - INTERVAL '3 hours'),
      (v_professor_id, 'SISTEMA', 'Relatório semanal disponível', 'O relatório de frequência da semana está pronto.', true, NOW() - INTERVAL '1 day');
    RAISE NOTICE 'Notificações do professor.seed inseridas';
  END IF;

  -- =====================
  -- Notificações do BRUNO
  -- =====================
  IF v_bruno_id IS NOT NULL THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, lida, criado_em) VALUES
      (v_bruno_id, 'MATRICULA_APROVADA', 'Bem-vindo ao Dojoro!', 'Sua conta foi criada com sucesso. Explore o app!', false, NOW() - INTERVAL '10 minutes'),
      (v_bruno_id, 'AULA_PROXIMA', 'Próxima aula às 10:00', 'Adulto Gi - Sábado. Prepare-se para treinar!', false, NOW() - INTERVAL '1 hour'),
      (v_bruno_id, 'STREAK_ALCANCADO', '🔥 5 semanas consecutivas!', 'Incrível! Você é um atleta dedicado.', false, NOW() - INTERVAL '2 days'),
      (v_bruno_id, 'GRADUACAO_APROVADA', '🥋 Nova graduação!', 'Parabéns pela promoção para faixa azul 1º grau!', true, NOW() - INTERVAL '1 week');
    RAISE NOTICE 'Notificações do Bruno inseridas';
  END IF;

END $$;

-- ============================================
-- Verificar inserção
-- ============================================
SELECT 
  u.email,
  n.tipo,
  n.titulo,
  n.lida,
  n.criado_em
FROM notificacoes n
JOIN usuarios u ON u.id = n.usuario_id
ORDER BY n.criado_em DESC
LIMIT 15;
