-- SCRIPT DE TESTE: CRIAR SEGUNDA UNIDADE
-- Objetivo: Testar a troca de contexto entre unidades

-- 1) Criar a nova academia
INSERT INTO academias (nome, codigo_convite, ativo)
VALUES ('Dojoro Matriz', 'MATRIZ-2025', true)
ON CONFLICT (codigo_convite) DO NOTHING;

-- 2) Vincular usuários de teste (TI, Professor e Aluno)
DO $$
DECLARE
    v_academia_id UUID;
    v_user_ti UUID;
    v_user_prof UUID;
    v_user_aluno UUID;
BEGIN
    SELECT id INTO v_academia_id FROM academias WHERE codigo_convite = 'MATRIZ-2025' LIMIT 1;
    
    SELECT id INTO v_user_ti FROM usuarios WHERE email = 'ti.seed@example.com' LIMIT 1;
    SELECT id INTO v_user_prof FROM usuarios WHERE email = 'professor.seed@example.com' LIMIT 1;
    SELECT id INTO v_user_aluno FROM usuarios WHERE email = 'aluno.seed@example.com' LIMIT 1;

    -- MATRÍCULAS ATIVAS
    INSERT INTO matriculas (usuario_id, academia_id, numero_matricula, status, data_inicio)
    VALUES (v_user_ti, v_academia_id, 9001, 'ATIVA', NOW()),
           (v_user_prof, v_academia_id, 9002, 'ATIVA', NOW()),
           (v_user_aluno, v_academia_id, 9003, 'ATIVA', NOW())
    ON CONFLICT DO NOTHING;

    -- PAPÉIS TI
    INSERT INTO usuarios_papeis (usuario_id, academia_id, papel)
    VALUES (v_user_ti, v_academia_id, 'TI'),
           (v_user_ti, v_academia_id, 'ALUNO')
    ON CONFLICT DO NOTHING;

    -- PAPÉIS PROFESSOR
    INSERT INTO usuarios_papeis (usuario_id, academia_id, papel)
    VALUES (v_user_prof, v_academia_id, 'PROFESSOR'),
           (v_user_prof, v_academia_id, 'ALUNO')
    ON CONFLICT DO NOTHING;

    -- PAPÉIS ALUNO
    INSERT INTO usuarios_papeis (usuario_id, academia_id, papel)
    VALUES (v_user_aluno, v_academia_id, 'ALUNO')
    ON CONFLICT DO NOTHING;

    -- Criar um Tipo de Treino na nova unidade
    INSERT INTO tipos_treino (academia_id, codigo, nome, cor_identificacao)
    VALUES (v_academia_id, 'gi', 'BJJ Adulto - Matriz', '#3B82F6')
    ON CONFLICT DO NOTHING;

    -- Criar uma Turma na nova unidade
    INSERT INTO turmas (academia_id, tipo_treino_id, nome, dias_semana, hora_inicio, hora_fim)
    VALUES (v_academia_id, (SELECT id FROM tipos_treino WHERE academia_id = v_academia_id AND codigo = 'gi'), 'Turma Matriz Noite', ARRAY[1,2,3,4,5], '19:00', '20:30')
    ON CONFLICT DO NOTHING;

END $$;
