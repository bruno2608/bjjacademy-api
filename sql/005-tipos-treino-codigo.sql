-- Migration: adicionar codigo/descricao a tipos_treino e consolidar catalogo por academia

alter table tipos_treino
  add column if not exists codigo text,
  add column if not exists descricao text;

-- Backfill codigos conhecidos (seed atual)
update tipos_treino
   set codigo = 'nogi'
 where codigo is null
   and nome ilike '%no-gi%';

update tipos_treino
   set codigo = 'gi'
 where codigo is null
   and nome ilike '%gi%';

-- Normalize para minusculo / fallback para registros customizados sem codigo
update tipos_treino
   set codigo = lower(regexp_replace(nome, '[^a-z0-9]+', '-', 'g'))
 where codigo is null;

update tipos_treino
   set codigo = lower(codigo);

-- Descricoes padrao para manter contrato do endpoint
update tipos_treino
   set descricao = 'Treino sem kimono'
 where codigo = 'nogi'
   and (descricao is null or descricao = '');

update tipos_treino
   set descricao = 'Treino com kimono'
 where codigo = 'gi'
   and (descricao is null or descricao = '');

update tipos_treino
   set descricao = coalesce(descricao, 'Aulas infantis')
 where codigo = 'kids';

-- Inserir Kids para academias sem esse tipo
insert into tipos_treino (academia_id, nome, cor_identificacao, codigo, descricao)
select a.id,
       'Kids' as nome,
       '#22c55e' as cor_identificacao,
       'kids' as codigo,
       'Aulas infantis' as descricao
  from academias a
 where not exists (
   select 1
     from tipos_treino tt
    where tt.academia_id = a.id
      and tt.codigo = 'kids'
 );

create unique index if not exists uq_tipos_treino_codigo
  on tipos_treino (academia_id, codigo);

alter table tipos_treino
  alter column codigo set not null;
