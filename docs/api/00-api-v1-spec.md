# BJJAcademy API v1 — Especificação (atualizada)

Documento de referência rápida da API v1 do ecossistema **BJJAcademy / BJJAcademy Codex**, cobrindo convenções, módulos principais e endpoints de Auth já implementados.

---

## 1. Visão geral

- **O que é**: backend que centraliza autenticação, check-ins, dashboards e gestão acadêmica da BJJAcademy.
- **Stack**: NestJS + TypeScript, PostgreSQL (Supabase), acesso via `pg`/SQL cru (`DatabaseService`), JWT com roles, Swagger em `/v1/docs`.
- **Domínios principais**: Auth & Onboarding, Dashboards, Check-in & Presenças, Alunos & Graduações, Configurações.

---

## 2. Convenções gerais

- **Base URL / versão**: todas as rotas são servidas em `/v1` (ex.: `http://localhost:3000/v1`).
- **Formato**: JSON; headers padrão `Content-Type: application/json; charset=utf-8`.
- **Autenticação**: Bearer JWT no header `Authorization: Bearer <token>`.
- **Claims do JWT** (emitido no login):
  - `sub`: id do usuário (`usuarios.id`)
  - `email`
  - `role`: papel principal resolvido para a academia do token
  - `academiaId`: academia atual do usuário
- **Roles suportados**: `ALUNO`, `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
  - Prioridade de papel principal quando o usuário tem múltiplos papéis na mesma academia: `TI` > `ADMIN` > `PROFESSOR` > `INSTRUTOR` > `ALUNO`.
- **Swagger/OpenAPI**: disponível em `/v1/docs` com suporte ao botão **Authorize** para testar rotas protegidas.
- **Banco**: PostgreSQL (Supabase). Scripts de schema/seeds em `sql/` (ex.: `001-init-schema.sql`, `002-seed-demo-completa.sql`, `003-seed-faixas-e-regras-base.sql`).

---

## 3. Recursos e endpoints

### 3.1 Auth & Onboarding

#### 3.1.1 POST `/auth/login`

- **Descrição**: login com email/senha. Consulta usuários reais no banco, valida senha (`bcrypt`) e emite JWT.
- **Método/URL**: `POST /v1/auth/login`
- **Auth**: pública
- **Payload**:
  ```json
  {
    "email": "aluno.seed@example.com",
    "senha": "SenhaAluno123"
  }
  ```
- **Resposta**:
  ```json
  {
    "accessToken": "<jwt>",
    "refreshToken": "mock-refresh-token",
    "user": {
      "id": "58c9...",
      "nome": "Aluno Seed",
      "email": "aluno.seed@example.com",
      "role": "ALUNO",
      "academiaId": "46af..."
    }
  }
  ```
- **Notas**:
  - O `accessToken` traz os claims `sub`, `email`, `role`, `academiaId`.
  - O `refreshToken` ainda é mock; rota `/auth/refresh` existe mas será evoluída.

#### 3.1.2 GET `/auth/me`

**Descrição:**  
Retorna o perfil do usuário autenticado, incluindo:

- dados básicos (id, nome, email)
- papel principal na academia atual
- vínculo com a academia
- status da matrícula e faixa atual

É o endpoint que o PWA/App usa para responder “quem sou eu e o que posso ver?” logo após o login.

- **Método:** `GET`
- **URL:** `/v1/auth/me`
- **Auth:** `Authorization: Bearer <accessToken>` (obrigatório)  
- **Roles:** qualquer usuário autenticado (`ALUNO`, `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`)

**Fluxo típico via Swagger (`/v1/docs`):**

1. Chamar `POST /v1/auth/login` com `email` e `senha`.
2. Copiar o campo `accessToken` da resposta.
3. No Swagger, clicar em **Authorize** (cadeado verde).
4. Preencher com `Bearer <accessToken>` (ou apenas o token, conforme placeholder).
5. Confirmar e fechar o modal.
6. Ir em `GET /v1/auth/me` → **Try it out** → **Execute**.

O Swagger enviará automaticamente:

```http
Authorization: Bearer <accessToken>
```

**Exemplo de resposta 200 (ALUNO):**

```json
{
  "id": "58c97363-6137-46ff-b5b4-ec2cd77a075f",
  "nome": "Aluno Seed",
  "email": "aluno.seed@example.com",
  "role": "ALUNO",
  "academiaId": "46af5505-f3cd-4df2-b856-ce1a33471481",
  "academiaNome": "Academia Seed BJJ",
  "faixaAtual": "azul",
  "grauAtual": 1,
  "matriculaStatus": "ATIVA",
  "matriculaDataInicio": "2025-06-01T03:00:00.000Z",
  "matriculaDataFim": null
}
```

**Observação:** `role` é o papel principal do usuário na academia do token (prioridade `TI` > `ADMIN` > `PROFESSOR` > `INSTRUTOR` > `ALUNO`).  
**Códigos de resposta:**
- `200 OK` — usuário autenticado retornado.
- `401 Unauthorized` — token ausente, inválido ou expirado.
- `404 Not Found` — usuário do token não encontrado no banco.

#### 3.1.3 Demais rotas de Auth (estado atual)

- `GET /auth/convite/:codigo` — valida código de convite.
- `POST /auth/register` — conclui cadastro a partir de convite.
- `POST /auth/refresh` — renova tokens (mock; será evoluído).
- `POST /auth/forgot-password` — inicia fluxo de recuperação (stub).
- `POST /auth/reset-password` — redefine senha com token (stub).

### 3.2 Dashboards

- `GET /dashboard/aluno` — métricas e progresso do aluno (planejado).
- `GET /dashboard/staff` — visão operacional para staff/gestores (planejado).

### 3.3 Check-in & Presenças

- `GET /checkin/disponiveis` — aulas disponíveis para check-in (planejado).
- `POST /checkin` — efetiva check-in (validando QR/horário, planejado).
- `GET /presencas` e endpoints de ajuste/validação (planejado).

### 3.4 Alunos & Graduações

- `GET /alunos/:id/evolucao` — evolução de faixas/graus (planejado).
- `GET /graduacoes` / `POST /graduacoes` — registro de graduações (planejado).

### 3.5 Configurações

- `GET /config/regras-graduacao` / `PUT /config/regras-graduacao/:faixaSlug` — regras de graduação (planejado).
- `GET /config/tipos-treino` — tipos/modalidades de treino (planejado).
- `POST /invites` — geração de convites (planejado).

---

## 4. Padrões de resposta e erros

- **Status codes**:
  - `200 OK`, `201 Created`
  - `400 Bad Request` — validação de entrada
  - `401 Unauthorized` — token ausente/expirado
  - `403 Forbidden` — autenticado porém sem permissão/role
  - `404 Not Found` — recurso ou usuário não encontrado no contexto
  - `422 Unprocessable Entity` — regra de negócio violada
  - `500 Internal Server Error` — erro não tratado
- **Formato de erro sugerido**:
  ```json
  {
    "statusCode": 422,
    "error": "Unprocessable Entity",
    "message": "Aluno já possui check-in nesta aula",
    "details": {
      "aulaId": "uuid-...",
      "alunoId": "uuid-..."
    }
  }
  ```

---

## 5. Notas rápidas de implementação

- Validar role e pertencimento à academia para rotas protegidas.
- `TI` deve ter no mínimo as permissões de `ADMIN`, com abrangência multi-academia conforme evolução.
- Dashboards devem retornar números já agregados, evitando cálculos pesados no frontend.
- Check-in deve validar QR/TTL e impedir duplicidades.
