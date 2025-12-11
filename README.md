# BJJAcademy API v1

Backend em NestJS para autenticação, check-ins, dashboards e gestão acadêmica da BJJAcademy/Codex.

## Visão geral
- Camada backend para PWA/app e painel administrativo da BJJAcademy.
- Módulos principais: Auth & Onboarding, Dashboards, Check-in & Presenças, Alunos, Graduações, Configurações.
- Documentação interativa via Swagger em `/v1/docs`.

## Stack
- NestJS + TypeScript
- PostgreSQL (Supabase recomendado)
- `pg` + SQL raw com `DatabaseService` (sem ORM)
- JWT com roles (`ALUNO`, `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`)
- Swagger/OpenAPI em `/v1/docs`

## Pré-requisitos
- Node.js 18+ (recomendado)
- NPM ou Yarn
- Banco PostgreSQL (local ou Supabase)
- URL de conexão exemplo (ajuste host/credenciais):
  - `postgresql://usuario:senha@host:5432/database?sslmode=require`

## Configuração de ambiente
- Use o `.env.example` como base.
- Exemplo de `.env` (sem credenciais reais):
  ```env
  DATABASE_URL=postgresql://usuario:senha@host:5432/database?sslmode=require
  JWT_SECRET=uma_chave_segura_aqui
  JWT_EXPIRES_IN=1h
  PORT=3000
  ```

## Subindo o banco de dados
1. Crie o banco (local ou no Supabase).
2. Execute os scripts em ordem (estão em `sql/`):
   - `sql/001-init-schema.sql` (schema)
   - `sql/002-seed-demo-completa.sql` (usuários/demo)
   - `sql/003-seed-faixas-e-regras-base.sql` (faixas/regras)
3. Exemplo genérico com `psql`:
   ```bash
   psql "$DATABASE_URL" -f sql/001-init-schema.sql
   psql "$DATABASE_URL" -f sql/002-seed-demo-completa.sql
   psql "$DATABASE_URL" -f sql/003-seed-faixas-e-regras-base.sql
   ```

## Instalação e execução
```bash
npm install
npm run start:dev
```
- API padrão: `http://localhost:3000`

## Swagger / documentação da API
- Acesse `http://localhost:3000/v1/docs`.
- Fluxo típico para testar rotas protegidas:
  1) Faça login em `POST /v1/auth/login`.
  2) Copie o `accessToken`.
  3) Clique em **Authorize** no Swagger.
  4) Cole o token (com ou sem `Bearer`, conforme placeholder).
  5) Teste `GET /v1/auth/me` e demais rotas protegidas.

## Usuários seed para teste
Senhas definidas em `sql/002-seed-demo-completa.sql`.

- Aluno — email: `aluno.seed@example.com`, papel: `ALUNO`, senha: `SenhaAluno123`
- Instrutor — email: `instrutor.seed@example.com`, papéis: `ALUNO` + `INSTRUTOR`, senha: `SenhaInstrutor123`
- Professor — email: `professor.seed@example.com`, papéis: `ALUNO` + `PROFESSOR`, senha: `SenhaProfessor123`
- Admin — email: `admin.seed@example.com`, papéis: `ALUNO` + `ADMIN`, senha: `SenhaAdmin123`
- TI — email: `ti.seed@example.com`, papéis: `ALUNO` + `TI`, senha: `SenhaTi123`

## Roadmap curto (MVP)
- [x] Módulo Auth: login + `/auth/me`
- [ ] Dashboard do Aluno: `/dashboard/aluno`
- [ ] Dashboard do Staff: `/dashboard/staff`
- [ ] Check-in: `/checkin/disponiveis` + `POST /checkin`
- [ ] Gestão de presenças: `/presencas/*`
- [ ] Graduações: `/alunos/:id/evolucao` + `/graduacoes`
