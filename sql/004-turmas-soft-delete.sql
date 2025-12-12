-- Migration: adicionar soft-delete em turmas
alter table turmas
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

create index if not exists idx_turmas_academia_deleted
  on turmas (academia_id, deleted_at);
