# Changelog

Todas as mudanças notáveis do projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Publicado]

### Adicionado
- Endpoint `/presencas/pendencias` com filtros `from`/`to`
- Endpoint `/presencas/:id/decisao` para aprovar/rejeitar
- SQL seed `019-seed-pendencias-variadas.sql` para dados de teste
- Documentação Swagger em todos os endpoints

### Corrigido
- **COALESCE faixa**: Usar `faixa_declarada` como fallback em endpoints:
  - `alunos.service.ts` - método `listar()`
  - `auth.repository.ts` - método `findUserProfileByIdAndAcademia()`
  - `equipe.service.ts` - método `listarEquipe()`
  - `dashboard.service.ts` - método `getAlunoDashboard()`
- **Login PENDENTE**: Removido filtro `status = 'ACTIVE'` em `auth.repository.ts`
- Parsing de datas no endpoint de pendências
- Timezone UTC na consulta de pendências

---

## [0.1.0] - 2024-12-19

### Adicionado
- Sistema de convite seguro (token + OTP + HMAC signature)
- Endpoint `/auth/validate-invite-otp`
- Endpoint `/auth/secure-register`
- EmailService com templates de convite
- Endpoint `/invites` para CRUD de convites
- HMAC signature validation

---

## [0.0.1] - 2024-12-18

### Adicionado
- Estrutura inicial NestJS
- Autenticação JWT (access + refresh tokens)
- Módulos: auth, users, academias, turmas, aulas, presenças
- Swagger UI em `/v1/docs`
- PostgreSQL com Supabase
- Rate limiting
- Health check `/health`
