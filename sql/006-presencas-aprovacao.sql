-- Migration: aprovacao de presencas (additive, sem alterar dados existentes)

-- Novas colunas para workflow de aprovacao/rejeicao
alter table presencas
  add column if not exists aprovacao_status text not null default 'APROVADA',
  add column if not exists aprovado_por uuid,
  add column if not exists aprovado_em timestamptz,
  add column if not exists rejeitado_por uuid,
  add column if not exists rejeitado_em timestamptz,
  add column if not exists aprovacao_observacao text;

-- Constraint (NOT VALID para evitar lock pesado em prod)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'presencas_aprovacao_status_check'
      and conrelid = 'public.presencas'::regclass
  ) then
    alter table presencas
      add constraint presencas_aprovacao_status_check
      check (aprovacao_status in ('PENDENTE','APROVADA','REJEITADA'))
      not valid;
  end if;
end$$;

-- Indices uteis para pendencias/aprovacao
create index if not exists idx_presencas_academia_aprovacao_criado
  on presencas (academia_id, aprovacao_status, criado_em desc);

-- Dedupe/lookup por aula+aluno
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'presencas'
      and indexname = 'presencas_aula_id_aluno_id_idx'
  ) then
    create index presencas_aula_id_aluno_id_idx on presencas (aula_id, aluno_id);
  end if;
end$$;
