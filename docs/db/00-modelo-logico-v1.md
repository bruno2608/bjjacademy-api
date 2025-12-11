Esta proposta de esquema de banco de dados **PostgreSQL** foi desenhada para atender exatamente aos requisitos da **API v1**, e aos domínios de negócio definidos na documentação,.

O modelo utiliza **UUIDs** para chaves primárias (padrão robusto para escalabilidade), **Timestamptz** para datas e mantém a separação estrita entre dados de acesso (Auth) e regras de negócio (Core).

---

### 1. Módulo Auth & Onboarding
*Suporta os endpoints `/auth/*` e a gestão multi-tenant de usuários e academias.*

#### Tabela: `academias`
Centraliza as unidades.
*   **id** `UUID` (PK)
*   **nome** `VARCHAR(255)` — Nome da unidade.
*   **codigo_convite** `VARCHAR(20)` (UNIQUE) — Código geral da academia (ex: "BJJ-UNIT1") para convites genéricos.
*   **ativo** `BOOLEAN` — Soft delete/desativação.
*   **criado_em** `TIMESTAMPTZ` DEFAULT NOW()

#### Tabela: `usuarios`
Dados de identidade e perfil global.
*   **id** `UUID` (PK)
*   **email** `VARCHAR(254)` (UNIQUE) — Normalizado (lowercase).
*   **senha_hash** `VARCHAR(255)` — Hash seguro (Argon2/Bcrypt).
*   **nome_completo** `VARCHAR(120)`
*   **status** `VARCHAR(20)` — Enum: `INVITED`, `ACTIVE`, `INACTIVE`.
*   **faixa_atual_slug** `VARCHAR(50)` — FK para tabela `faixas`. Cache da faixa atual para performance.
*   **grau_atual** `INTEGER` — 0 a 4.
*   **aceitou_termos** `BOOLEAN` — Obrigatório para LGPD/Responsabilidade.
*   **criado_em** `TIMESTAMPTZ`

#### Tabela: `usuarios_papeis`
Resolve a relação N:N, permitindo que um usuário tenha papéis diferentes em academias diferentes (ex: Professor na Academia A, Aluno na Academia B).
*   **id** `UUID` (PK)
*   **usuario_id** `UUID` — FK para `usuarios`.
*   **academia_id** `UUID` — FK para `academias`.
*   **papel** `VARCHAR(20)` — Enum restrito: `ALUNO`, `INSTRUTOR`, `PROFESSOR`, `ADMIN`, `ADMIN_TI`.
*   **Unique Constraint:** `(usuario_id, academia_id, papel)` para evitar duplicatas.

#### Tabela: `convites`
Gerencia convites individuais enviados por e-mail.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para `academias`.
*   **email** `VARCHAR(254)` — E-mail do convidado.
*   **token_hash** `VARCHAR(255)` (UNIQUE) — Token validado no endpoint `GET /auth/convite/:codigo`.
*   **papel_sugerido** `VARCHAR(20)` — Papel que o usuário terá ao aceitar.
*   **expires_at** `TIMESTAMPTZ`
*   **used_at** `TIMESTAMPTZ` (Nullable) — Se preenchido, convite já foi usado.

---

### 2. Módulo Configurações & Core
*Suporta `/config/*`, regras de negócio e estrutura de turmas.*

#### Tabela: `faixas` (Domínio)
Tabela de referência para validação e ordem de progressão.
*   **slug** `VARCHAR(50)` (PK) — Ex: `branca`, `azul`, `preta`. Usado nas URLs da API.
*   **nome** `VARCHAR(50)` — Nome de exibição.
*   **categoria** `VARCHAR(20)` — `ADULTO`, `INFANTIL`.
*   **ordem** `INTEGER` — Inteiro sequencial para saber se uma faixa é superior a outra.
*   **graus_maximos** `INTEGER` — Geralmente 4.

#### Tabela: `regras_graduacao`
Define os requisitos para passar de faixa. Endpoint `GET/PUT /config/regras-graduacao`,.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para `academias` (permite regras personalizadas por unidade).
*   **faixa_slug** `VARCHAR(50)` — FK para `faixas`.
*   **aulas_minimas** `INTEGER` — Meta para dashboard.
*   **tempo_minimo_meses** `INTEGER`
*   **meta_aulas_no_grau** `INTEGER` — Para barra de progresso do aluno.

#### Tabela: `tipos_treino`
Categorias para agendamento.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para `academias`.
*   **nome** `VARCHAR(50)` — Ex: "Gi", "No-Gi", "Kids".
*   **cor_identificacao** `VARCHAR(7)` — Hex code para calendário (opcional).

#### Tabela: `turmas` (Definição)
A estrutura recorrente da grade.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para `academias`.
*   **tipo_treino_id** `UUID` — FK para `tipos_treino`.
*   **nome** `VARCHAR(100)` — Ex: "Jiu-Jitsu Avançado 19h".
*   **dias_semana** `INTEGER[]` — Array de 0-6 (Dom-Sab) ou JSONB.
*   **horario_padrao** `TIME`
*   **instrutor_padrao_id** `UUID` (Nullable) — FK para `usuarios`.

---

### 3. Módulo Check-in & Presenças
*Suporta o fluxo crítico de `/checkin`, `/aulas` e QR Code.*

#### Tabela: `aulas` (Instâncias)
A materialização de uma turma em uma data específica.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para `academias`.
*   **turma_id** `UUID` — FK para `turmas`.
*   **data_inicio** `TIMESTAMPTZ` — Data e hora exata da aula.
*   **data_fim** `TIMESTAMPTZ`
*   **status** `VARCHAR(20)` — `AGENDADA`, `EM_ANDAMENTO`, `ENCERRADA`, `CANCELADA`.
*   **qr_token** `VARCHAR(255)` — O token dinâmico atual para validação do endpoint `POST /checkin`,.
*   **qr_expires_at** `TIMESTAMPTZ` — Validade do token atual.

#### Tabela: `presencas`
O registro da frequência.
*   **id** `UUID` (PK)
*   **academia_id** `UUID` — FK para performance em queries globais.
*   **aula_id** `UUID` — FK para `aulas`.
*   **aluno_id** `UUID` — FK para `usuarios`.
*   **status** `VARCHAR(20)` — `PENDENTE` (manual não aprovado), `PRESENTE` (confirmado/QR), `FALTA`, `JUSTIFICADA`.
*   **origem** `VARCHAR(20)` — `MANUAL`, `QR_CODE`, `SISTEMA` (chamada do professor).
*   **registrado_por** `UUID` — FK para `usuarios` (quem fez a ação: o próprio aluno ou staff).
*   **criado_em** `TIMESTAMPTZ`
*   **Unique Constraint:** `(aula_id, aluno_id)` para impedir check-in duplicado na mesma aula.

#### Tabela: `matriculas`
Vincula aluno à academia e controla status de acesso para bloquear check-in.
*   **id** `UUID` (PK)
*   **usuario_id** `UUID` — FK para `usuarios`.
*   **academia_id** `UUID` — FK para `academias`.
*   **status** `VARCHAR(20)` — `ATIVA`, `TRANCADA`, `INADIMPLENTE`.
*   **data_inicio** `DATE`
*   **data_fim** `DATE` (Nullable).

---

### 4. Módulo Graduações
*Suporta o histórico e a promoção de faixas.*

#### Tabela: `graduacoes`
Histórico imutável de conquistas.
*   **id** `UUID` (PK)
*   **usuario_id** `UUID` — FK para `usuarios` (Aluno).
*   **academia_id** `UUID` — Onde ocorreu a graduação.
*   **faixa_slug** `VARCHAR(50)` — FK para `faixas`.
*   **grau** `INTEGER` — O grau recebido (ou NULL se for troca de faixa).
*   **data_graduacao** `DATE`
*   **professor_id** `UUID` — FK para `usuarios` (quem assinou a graduação).
*   **observacoes** `TEXT`
*   **criado_em** `TIMESTAMPTZ`

---

### Resumo Visual das Relações (Chaves Estrangeiras Críticas)

1.  **Segurança de Acesso:**
    `usuarios_papeis` ➔ `usuarios`
    `usuarios_papeis` ➔ `academias`

2.  **Fluxo de Check-in:**
    `presencas` ➔ `aulas` ➔ `turmas` ➔ `academias`
    `presencas` ➔ `usuarios` (Aluno)

3.  **Sistema de Faixas:**
    `usuarios` (faixa_atual) ➔ `faixas` (slug)
    `graduacoes` ➔ `faixas` (slug)
    `regras_graduacao` ➔ `faixas` (slug)

### Índices Recomendados (Performance)
1.  **`presencas(aluno_id, status)`**: Essencial para o cálculo rápido do endpoint `/dashboard/aluno` (contagem de aulas),.
2.  **`aulas(data_inicio, academia_id)`**: Para listar a agenda do dia (`GET /aulas/hoje`) e validação de check-in.
3.  **`usuarios(email)`**: Para login rápido.
4.  **`usuarios(faixa_atual_slug)`**: Para filtros na listagem de alunos (`GET /alunos`).