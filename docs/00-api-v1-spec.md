# BJJAcademy API v1 – Especificação (Revisada)

Este documento descreve a **API v1** do ecossistema **BJJAcademy / BJJAcademy Codex**, refinada com base nos documentos de escopo (módulos Aluno/Staff, fluxos de UX e domínios de negócio).

---

## 0. Notas de projeto (Análise de Cobertura)

Ao cruzar o escopo funcional com o rascunho inicial de API, foram identificados alguns pontos críticos que precisam estar cobertos na v1:

- **Convites e Onboarding**  
  O fluxo de “Primeiro Acesso” usa código de convite no formato `BJJ-XXXXXX`.  
  A API precisa permitir:
  - Validar código antes do cadastro (pré-cadastro).
  - Registrar usuário a partir de um convite válido.
  - (Opcional futuro) Geração de convites pelo staff.

- **Dashboards e Métricas (Hero)**  
  Telas de “Hero” para Aluno e Staff mostram métricas já agregadas (aulas no grau, meta, progresso, alunos ativos etc.).  
  A API deve expor endpoints que **entregam os números prontos**, evitando que o frontend tenha que juntar tudo manualmente.

- **Regras de Graduação**  
  O staff pode configurar requisitos de graduação (aulas mínimas, tempo mínimo em faixa, etc.).  
  É necessário um conjunto de endpoints para **listar e alterar essas regras**.

- **Check-in via QR Code**  
  O fluxo de check-in importante envolve QR Code projetado na TV/celular do professor.  
  A API deve:
  - Gerar/fornecer o token dinâmico da aula.
  - Validar o token no momento do check-in do aluno.

- **Configuração de Treinos / Grade Semanal**  
  O sistema diferencia:
  - **Tipos de treino** (Gi, No-Gi, Kids, etc.).
  - **Turmas / grade** (definição recorrente).
  - **Aulas** (instâncias no calendário, usadas para check-in).

A partir disso, a v1 da API foi refinada para contemplar:

- Dashboards específicos para aluno e staff.
- Endpoints de check-in separados da gestão de presenças.
- Validação de convites.
- CRUD básico de regras de graduação e tipos de treino.

---

## 1. Visão geral

A **BJJAcademy API v1** é a camada backend responsável por centralizar:

- **Autenticação e Onboarding**
  - Login, recuperação de conta, convites e registro de novos usuários.

- **Core do negócio**
  - Academias, alunos, matrículas, turmas e aulas.

- **Jornada do aluno**
  - Check-in (manual ou via QR Code), histórico de presenças, evolução de faixas.

- **Gestão do staff**
  - Aprovação/ajuste de presenças.
  - Registro de graduações.
  - Configuração de regras de graduação e tipos de treino.

### Objetivos principais

- Servir como backend único para:
  - **PWA / painel web** (BJJAcademy Codex).
  - **App mobile** (futuro).
  - Outras integrações (ex.: scoreboard, painéis administrativos).

- Concentrar as **regras de negócio** no backend:
  - Cálculo de aulas para graduação.
  - Validação de QR Code.
  - Regras de acesso por papel (Aluno, Instrutor, Professor, Admin/TI).

---

## 2. Convenções gerais

### 2.1. Base URL e versão

Exemplos de base URL:

- Produção: `https://api.bjjacademy.com/v1`
- Desenvolvimento: `https://api-dev.bjjacademy.com/v1`

Todas as rotas descritas abaixo assumem o prefixo `/v1`.

### 2.2. Formato de dados

- Requisições e respostas em **JSON**.
- Cabeçalho padrão:
  - `Content-Type: application/json; charset=utf-8`

### 2.3. Autenticação e segurança

- Autenticação via **JWT Bearer**:
  - `Authorization: Bearer <token>`
- Algumas rotas são públicas (login, validação de convite, forgot/reset password).
- Demais rotas exigem token válido.

### 2.4. Papéis (roles)

Papéis principais (detalhados em docs de escopo):

- `ALUNO`
- `INSTRUTOR`
- `PROFESSOR`
- `ADMIN`
- `TI` – suporte técnico / superadmin da plataforma, com acesso ampliado (inclusive multi-academia) e permissão para enxergar e gerenciar dados em nível mais global do que o ADMIN.

Controle de acesso:

- Rotas de dashboard, check-in e histórico de presenças do aluno: role `ALUNO`.
- Rotas de aprovação de presenças, dashboards operacionais, gestão de regras e graduações: `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- Quando necessário, a doc especifica o papel esperado.

---

## 3. Recursos e endpoints

A seguir, os principais recursos e endpoints planejados para a v1.  
Os formatos exatos de DTOs (request/response) serão detalhados na fase de implementação, mas esta seção define o **contrato de alto nível**.

---

### 3.1. Autenticação & Onboarding (Auth)

Baseado nos fluxos de convite e login descritos em `docs/escopo/05-fluxos-criticos-ux.md`.

#### 3.1.1. POST `/auth/login`

- **Descrição:** Login com email/senha.
- **Acesso:** Público.
- **Resposta (conceito):**
  - `accessToken`, `refreshToken` (se adotado).
  - Objeto `user` com id, nome, email, role principal e referência de academia.

#### 3.1.2. GET `/auth/convite/:codigo`

- **Descrição:** Valida um código de convite no formato `BJJ-XXXXXX`.
- **Acesso:** Público.
- **Resposta (conceito):**
  - Indica se o código é válido, expirado ou inválido.
  - Pode retornar dados como:
    - academia associada,
    - papel sugerido (ex.: aluno),
    - email pré-preenchido (quando aplicável).

#### 3.1.3. POST `/auth/register`

- **Descrição:** Conclui o cadastro de um usuário a partir de um convite válido ou fluxo de registro público.
- **Acesso:** Público.
- **Payload (conceito):**
  - `codigoConvite` (quando aplicável).
  - Dados pessoais (nome, email, senha, etc.).
- **Efeito esperado:**
  - Cria o usuário.
  - Cria matrícula inicial na academia associada.
  - Define papel padrão (normalmente `ALUNO`).

#### 3.1.4. POST `/auth/refresh`

- **Descrição:** Renova o token de acesso a partir de um refresh token válido.
- **Acesso:** Autenticado (ou baseado em refresh token).
- **Obs.:** Estratégia de refresh é opcional na v1, mas o endpoint já fica reservado.

#### 3.1.5. POST `/auth/forgot-password`

- **Descrição:** Inicia fluxo de “Esqueci minha senha”.
- **Acesso:** Público.
- **Efeito esperado:**
  - Gera e envia token/código de recuperação (por email).

#### 3.1.6. POST `/auth/reset-password`

- **Descrição:** Finaliza redefinição de senha usando token/código.
- **Acesso:** Público (mas vinculado a um token de recuperação válido).

---

### 3.2. Dashboards & Métricas

Criados para suportar as telas “Hero” do aluno e do staff, com dados agregados prontos.

#### 3.2.1. GET `/dashboard/aluno`

- **Papel:** `ALUNO`.
- **Descrição:** Retorna o “hero” do aluno, com visão geral da sua jornada.
- **Resposta (conceito):**
  - Próxima aula (id, data/hora, turma).
  - Total de aulas no grau atual.
  - Meta de aulas para próxima graduação.
  - Percentual de progresso (0–100%).
  - Status da matrícula (ativa, suspensa, etc.).

#### 3.2.2. GET `/dashboard/staff`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Retorna métricas operacionais para staff/professor.
- **Resposta (conceito):**
  - Total de alunos ativos.
  - Número de check-ins pendentes de aprovação no dia.
  - Graduações próximas (ex.: alunos que atingiram aulas/tempo).
  - Outras métricas relevantes da operação diária.

---

### 3.3. Check-in & Presenças

Refinado para separar a **ação do aluno** (check-in) da **gestão do professor** (presenças).

#### 3.3.1. GET `/checkin/disponiveis`

- **Papel:** `ALUNO`.
- **Descrição:** Lista as aulas/treinos do dia disponíveis para check-in pelo aluno autenticado.
- **Resposta (conceito):**
  - Lista de aulas com:
    - id, horário, turma, tipo de treino, status de check-in (feito/não feito).

#### 3.3.2. POST `/checkin`

- **Papel:** `ALUNO`.
- **Descrição:** Registra o check-in do aluno.
- **Payload (conceito):**

```json
{
  "aulaId": "uuid-da-aula",
  "tipo": "MANUAL" | "QR",
  "qrToken": "token-do-qr-code-opcional"
}
```

**Regras principais (conceituais):**

- Se `tipo = "QR"`:
  - Validar o `qrToken` associado à aula.
  - Validar se o token não está expirado.
- Se `tipo = "MANUAL"`:
  - Pode criar uma presença com status `PENDENTE`, aguardando aprovação do staff (dependendo da configuração).
- Impedir check-ins duplicados para a mesma aula/aluno.

#### 3.3.3. GET `/presencas/pendencias`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Lista presenças pendentes de aprovação/ajuste.
- **Uso típico:** tela de revisão de check-ins feitos manualmente ou com inconsistências.

#### 3.3.4. PATCH `/presencas/:id/status`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Atualiza o status de uma presença (aprovação, reprovação, ajuste).
- **Exemplos de status:**
  - `PRESENTE`
  - `FALTA`
  - `AJUSTADO` (ex.: correção posterior)

#### 3.3.5. GET `/alunos/:id/historico-presencas`

- **Papel:**
  - `ALUNO` (para seu próprio id);
  - `INSTRUTOR` / `PROFESSOR` / `ADMIN` / `TI` (para qualquer aluno da academia).
- **Descrição:** Retorna histórico de presenças de um aluno.
- **Filtros possíveis:**
  - Intervalo de datas.
  - Faixa atual.
  - Turma/tipo de treino.

---

### 3.4. Turmas, Aulas & QR Code

Baseado no domínio de turmas (definição), aulas (instâncias) e check-in por aula.

#### 3.4.1. GET `/turmas`

- **Papel:**
  - `INSTRUTOR` / `PROFESSOR` / `ADMIN` / `TI` → lista completa da academia.
  - `ALUNO` → apenas turmas em que o aluno está vinculado (pode ser aplicado via regra de negócio).
- **Descrição:** Lista turmas cadastradas (nome, faixa alvo, professor, horários).

#### 3.4.2. GET `/aulas/hoje`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Lista todas as aulas (ocorrências) do dia para a academia atual.
- **Uso típico:** painel de chamadas/gestão do dia.

#### 3.4.3. GET `/aulas/:id/qrcode`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Gera ou retorna o token atual para o QR Code de uma aula.
- **Resposta (conceito):**
  - `qrToken` (string segura, com TTL).
  - Informações básicas da aula (horário, turma, etc.).
- **Uso típico:** professor abre essa rota (direta ou via painel) para projetar o QR Code numa TV/celular.

---

### 3.5. Alunos, Graduações & Evolução

Ajustado para considerar regras de graduação e histórico de evolução.

#### 3.5.1. GET `/alunos`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Lista alunos da academia, com filtros.
- **Filtros (conceito):**
  - Nome.
  - Faixa atual.
  - Status (ativo, inativo, convidado, etc.).
- **Resposta:** dados básicos do aluno + faixa atual + status de matrícula.

#### 3.5.2. GET `/alunos/:id`

- **Papel:**
  - `ALUNO` (para seu próprio id);
  - `INSTRUTOR` / `PROFESSOR` / `ADMIN` / `TI` (para qualquer aluno da academia).
- **Descrição:** Perfil completo do aluno.
- **Conteúdo (conceito):**
  - Dados pessoais.
  - Matrícula (número, academia, status).
  - Faixa e grau atuais.
  - Resumo de presenças.

#### 3.5.3. GET `/alunos/:id/evolucao`

- **Papel:** `ALUNO` (próprio) ou `INSTRUTOR` / `PROFESSOR` / `ADMIN` / `TI`.
- **Descrição:** Linha do tempo de graduações do aluno + projeção de próxima faixa/grau.
- **Resposta (conceito):**
  - Histórico de graduações:
    - faixa anterior/nova, grau anterior/novo, data, professor.
  - Dados de progresso:
    - aulas realizadas na faixa atual,
    - metas de aulas e/ou tempo,
    - porcentagem de progresso.

#### 3.5.4. POST `/graduacoes`

- **Papel:** `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Registra nova graduação de um aluno (faixa ou grau).
- **Payload (conceito):**
  - `alunoId`
  - `faixaAnterior`, `grauAnterior`
  - `faixaNova`, `grauNovo`
  - `dataGraduacao`
  - `professorId`
  - `observacoes` (opcional)

#### 3.5.5. GET `/config/regras-graduacao`

- **Papel:** `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Lista regras de graduação por faixa (aulas mínimas, tempo mínimo, etc.).
- **Uso típico:** tela de configurações do professor/admin/TI.

#### 3.5.6. PUT `/config/regras-graduacao/:faixaSlug`

- **Papel:** `ADMIN`/`TI` (ou `PROFESSOR` com permissão).
- **Descrição:** Atualiza requisitos de graduação de uma faixa específica.
- **Payload (conceito):**
  - `aulasMinimas`
  - `tempoMinimoMeses`
  - Outras regras relacionadas ao modelo de negócio.

---

### 3.6. Configurações Gerais & Convites

#### 3.6.1. GET `/config/tipos-treino`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI` (podendo permitir leitura para `ALUNO`).
- **Descrição:** Lista tipos/modalidades de treino (Gi, No-Gi, Kids, Competition Class, etc.).
- **Uso típico:** filtros de tela e configurações de turmas.

#### 3.6.2. POST `/invites`

- **Papel:** `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `TI`.
- **Descrição:** Gera novos convites (código BJJ-XXXXXX) para onboarding.
- **Payload (conceito):**
  - Email (opcional).
  - Papel sugerido.
  - Data de expiração opcional.
- **Resposta (conceito):**
  - Código de convite gerado.
  - Metadados (valido até, academia, papel).

---

## 4. Padrões de resposta e erros

### 4.1. Códigos de status

- **200 OK** — Operação bem-sucedida (GET/PATCH).
- **201 Created** — Recurso criado com sucesso (POST).
- **400 Bad Request** — Erro de validação de campos de entrada (ex.: payload inválido).
- **401 Unauthorized** — Ausência de token ou token inválido/expirado.
- **403 Forbidden** — Usuário autenticado, porém sem permissão (role inadequado ou academia diferente).
- **404 Not Found** — Recurso não encontrado ou não pertencente ao contexto do usuário.
- **422 Unprocessable Entity** — Regra de negócio violada (ex.: check-in duplicado, QR Code expirado, tentativa de graduação sem cumprir requisitos).
- **500 Internal Server Error** — Erro não tratado no backend.

### 4.2. Formato de erro padrão (conceito)

Um formato possível (pode ser detalhado na implementação):

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

## 5. Pontos de atenção para implementação

### Validação de QR Code

O endpoint `POST /checkin` deve:

- Validar o `qrToken` contra a aula (`aulaId`).
- Respeitar o tempo de expiração (TTL) do QR.
- Evitar reutilização indevida do token.

### Cálculo de progresso para dashboard do aluno

O endpoint `GET /dashboard/aluno` deve:

- Cruzar presenças (`presencas`) com regras de graduação (`regras-graduacao`).
- Entregar porcentagem de progresso já calculada, evitando lógica pesada no frontend.

### Controle de papéis e segurança

Cada rota deve validar não apenas o token, mas também:

- Papel (role) adequado.
- Pertinência à mesma academia (quando aplicável).

### Papel TI (suporte / superadmin)

- O papel `TI` deve ter, no mínimo, todas as permissões do `ADMIN`, podendo visualizar e atuar em múltiplas academias quando a arquitetura multi-tenant estiver habilitada. Em qualquer lugar onde a API restringe ações a `ADMIN`, o `TI` também deve ser considerado autorizado.

### Evolução incremental

Esta especificação foca no escopo mínimo da v1 (MVP).

Endpoints adicionais (ex.: gestão avançada de academias, multi-tenant global, relatórios avançados) podem ser adicionados em versões futuras (v1.1, v2) com base na mesma estrutura geral.




