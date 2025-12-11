-- LIMPAR DADOS DEV SEM DROPAR TABELAS

truncate table
  presencas,
  graduacoes,
  matriculas,
  aulas,
  turmas,
  tipos_treino,
  regras_graduacao,
  usuarios_papeis,
  convites,
  usuarios,
  academias,
  faixas
restart identity cascade;
