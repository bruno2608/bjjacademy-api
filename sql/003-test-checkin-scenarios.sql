-- ============================================================
-- SCRIPT DE TESTE: CENÁRIOS DE CHECK-IN PARA TODOS OS PERFIS
-- Execute após o 002-seed-demo-completa.sql
-- ============================================================

-- ============================
-- 1) GARANTIR AULA DE HOJE COM QR VÁLIDO
-- ============================

-- Busca turma e cria aula de hoje se necessário
WITH turma_gi AS (
  SELECT t.id as turma_id, t.academia_id
  FROM turmas t
  JOIN academias a ON a.id = t.academia_id
  WHERE a.codigo_convite = 'DOJ-SEED1'
    AND t.nome = 'Adulto Gi Noite'
  LIMIT 1
),
hoje AS (
  SELECT (date_trunc('day', now() at time zone 'America/Sao_Paulo'))::date as dia
)
INSERT INTO aulas (academia_id, turma_id, data_inicio, data_fim, status, qr_token, qr_expires_at)
SELECT
  t.academia_id,
  t.turma_id,
  (h.dia + time '19:00') at time zone 'America/Sao_Paulo',
  (h.dia + time '20:30') at time zone 'America/Sao_Paulo',
  'AGENDADA',
  'TEST-QR-TOKEN-' || to_char(now(), 'YYYYMMDD'),
  now() + interval '2 hours'
FROM turma_gi t, hoje h
WHERE NOT EXISTS (
  SELECT 1 FROM aulas au
  WHERE au.turma_id = t.turma_id
    AND au.data_inicio::date = h.dia
);

-- Atualiza aula de hoje com QR Token válido
UPDATE aulas
SET qr_token = 'TEST-QR-TOKEN-' || to_char(now(), 'YYYYMMDD'),
    qr_expires_at = now() + interval '2 hours',
    status = 'AGENDADA'
WHERE id = (
  SELECT au.id FROM aulas au
  JOIN turmas t ON t.id = au.turma_id
  JOIN academias a ON a.id = au.academia_id
  WHERE a.codigo_convite = 'DOJ-SEED1'
    AND t.nome = 'Adulto Gi Noite'
    AND au.data_inicio::date = (now() at time zone 'America/Sao_Paulo')::date
  LIMIT 1
);

-- ============================
-- 2) LIMPAR PRESENÇAS ANTERIORES PARA RE-TESTAR
-- ============================

-- Limpa presenças da aula de hoje para todos os usuários de teste
DELETE FROM presencas
WHERE aula_id = (
  SELECT au.id FROM aulas au
  JOIN turmas t ON t.id = au.turma_id
  JOIN academias a ON a.id = au.academia_id
  WHERE a.codigo_convite = 'DOJ-SEED1'
    AND t.nome = 'Adulto Gi Noite'
    AND au.data_inicio::date = (now() at time zone 'America/Sao_Paulo')::date
  LIMIT 1
);

-- ============================
-- 3) VERIFICAR DADOS DE TESTE
-- ============================

-- Mostra a aula de hoje com QR Token
SELECT 
  au.id as aula_id,
  t.nome as turma,
  au.data_inicio,
  au.status,
  au.qr_token,
  au.qr_expires_at
FROM aulas au
JOIN turmas t ON t.id = au.turma_id
JOIN academias a ON a.id = au.academia_id
WHERE a.codigo_convite = 'DOJ-SEED1'
  AND t.nome = 'Adulto Gi Noite'
  AND au.data_inicio::date = (now() at time zone 'America/Sao_Paulo')::date
LIMIT 1;

-- Mostra usuários de teste e seus papéis
SELECT 
  u.id,
  u.email,
  u.nome_completo,
  u.faixa_atual_slug,
  array_agg(up.papel ORDER BY up.papel) as papeis
FROM usuarios u
JOIN usuarios_papeis up ON up.usuario_id = u.id
JOIN academias a ON a.id = up.academia_id
WHERE a.codigo_convite = 'DOJ-SEED1'
GROUP BY u.id, u.email, u.nome_completo, u.faixa_atual_slug
ORDER BY u.email;

-- ============================
-- 4) CASOS DE USO POR PERFIL
-- ============================

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 1: ALUNO PURO - Check-in via QR Code                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: aluno.seed@example.com (Senha: SenhaAluno123)                       ║
║ Papel: ALUNO                                                                 ║
║ Ação: Escanear QR Code da aula                                               ║
║ Resultado Esperado: Presença PRESENTE, origem QR_CODE                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

-- Simula check-in do ALUNO via QR (para debug no banco)
-- No app, o aluno enviaria: POST /checkin { aulaId, tipo: 'QR', qrToken: 'TEST-QR-TOKEN-YYYYMMDD' }

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 2: ALUNO PURO - Check-in Manual (Fallback)                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: aluno.seed@example.com (Senha: SenhaAluno123)                       ║
║ Papel: ALUNO                                                                 ║
║ Ação: Solicitar check-in manual (sem QR)                                     ║
║ Resultado Esperado: Presença PENDENTE, origem MANUAL, aguarda aprovação     ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 3: INSTRUTOR - Gerar QR Code para aula que ministra                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: instrutor.seed@example.com (Senha: SenhaInstrutor123)               ║
║ Papéis: INSTRUTOR + ALUNO                                                    ║
║ Ação: Acessar tela de Check-in > Ver layout Staff > Abrir QR                 ║
║ Resultado Esperado: Modal com QR Code exibido, timer de expiração            ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 4: INSTRUTOR - Fazer check-in como aluno em OUTRA aula                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: instrutor.seed@example.com (Senha: SenhaInstrutor123)               ║
║ Papéis: INSTRUTOR + ALUNO                                                    ║
║ Cenário: Instrutor quer treinar na aula de outro instrutor                   ║
║ Problema Atual: Tela de Check-in mostra layout de STAFF, não de ALUNO        ║
║ Solução Proposta: Adicionar toggle "Ver como Aluno" ou detectar aulas que    ║
║                   o usuário NÃO ministra e mostrar scanner para essas        ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 5: PROFESSOR - Gerar QR Code para aula que ministra                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: professor.seed@example.com (Senha: SenhaProfessor123)               ║
║ Papéis: PROFESSOR + ALUNO                                                    ║
║ Ação: Acessar tela de Check-in > Ver layout Staff > Abrir QR                 ║
║ Resultado Esperado: Modal com QR Code exibido                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 6: PROFESSOR - Fazer check-in como aluno em aula de OUTRO professor    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: professor.seed@example.com (Senha: SenhaProfessor123)               ║
║ Papéis: PROFESSOR + ALUNO                                                    ║
║ Cenário: Professor quer treinar, mas não está dando aula                     ║
║ Problema Atual: Mesmo do Caso 4 - mostra Staff view, não Aluno               ║
║ Solução Proposta: Mesma do Caso 4                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 7: ADMIN - Aprovar check-in manual de aluno                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: admin.seed@example.com (Senha: SenhaAdmin123)                       ║
║ Papéis: ADMIN + ALUNO                                                        ║
║ Ação: Acessar tela de Pendências > Aprovar presença pendente                 ║
║ Resultado Esperado: Status muda de PENDENTE para PRESENTE                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ CASO 8: TI - Visualizar logs e métricas de check-in                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Usuário: ti.seed@example.com (Senha: SenhaTi123)                             ║
║ Papéis: TI + ALUNO                                                           ║
║ Ação: Acesso administrativo total                                            ║
║ Resultado Esperado: Mesmas permissões de ADMIN                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

-- ============================
-- 5) QUERY DE VALIDAÇÃO APÓS TESTES
-- ============================

-- Verifica presenças após rodar os testes
SELECT 
  p.id,
  u.email as aluno,
  t.nome as turma,
  p.status,
  p.origem,
  p.criado_em
FROM presencas p
JOIN usuarios u ON u.id = p.aluno_id
JOIN aulas au ON au.id = p.aula_id
JOIN turmas t ON t.id = au.turma_id
WHERE au.data_inicio::date = (now() at time zone 'America/Sao_Paulo')::date
ORDER BY p.criado_em DESC;

-- ============================
-- 6) JSON PARA QR CODE DE TESTE
-- ============================

-- Use este JSON no scanner ou crie um QR Code com ele:
SELECT json_build_object(
  'aulaId', au.id,
  'token', au.qr_token
) as qr_code_json
FROM aulas au
JOIN turmas t ON t.id = au.turma_id
JOIN academias a ON a.id = au.academia_id
WHERE a.codigo_convite = 'DOJ-SEED1'
  AND t.nome = 'Adulto Gi Noite'
  AND au.data_inicio::date = (now() at time zone 'America/Sao_Paulo')::date
LIMIT 1;
