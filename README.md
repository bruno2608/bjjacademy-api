<div align="center">
  <img src="https://i.imgur.com/WdGink9.png" alt="Logo do Dojoro" width="220" />

  <h1>Dojoro API 🥋</h1>
  <p>O sistema que organiza a vida da academia de Jiu-Jitsu. Do primeiro treino à faixa preta.</p>

  <p align="center">
    <img src="https://img.shields.io/badge/status-estável-green" alt="Status" />
    <img src="https://img.shields.io/badge/Node.js-18+-blue" alt="Node Version" />
    <img src="https://img.shields.io/badge/NestJS-10.x-red" alt="NestJS" />
    <img src="https://img.shields.io/badge/PostgreSQL-Supabase-blue" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
  </p>
</div>

---

## 📖 Sobre o Projeto

O **Dojoro** é uma API robusta projetada para gerenciar todos os aspectos de uma academia de artes marciais, com foco inicial em Jiu-Jitsu. Desde o controle de frequência (check-in via QR Code) até o acompanhamento detalhado da evolução técnica e graduações dos alunos.

---

## 🚀 Tecnologias

- 🛡️ **NestJS** – Framework Node.js progressivo para aplicações escaláveis.
- 🐘 **PostgreSQL** – Banco de dados relacional (otimizado para Supabase).
- 🔑 **JWT** – Autenticação segura com rotação de Refresh Tokens.
- 📘 **Swagger** – Documentação interativa da API (`/v1/docs`).
- 📧 **Resend** – Integração premium para notificações por e-mail ([contato@dojoro.com.br](mailto:contato@dojoro.com.br)).
- 🐳 **Docker** – Ambiente de CI e testes isolados.

---

## 🛠️ Instalação e Ambiente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
```

### Principais variáveis (`.env`)

- `DATABASE_URL`: String de conexão (ex: `postgresql://user:pass@host:5432/db`).
- `JWT_SECRET`: Chave para assinatura de tokens (mínimo 32 caracteres).
- `RESEND_API_KEY`: ApiKey para envio de e-mails.
- `APP_TIMEZONE`: Timezone para cálculos de "hoje" (Padrão: `America/Sao_Paulo`).

---

## 🗄️ Banco de Dados

Aplique os scripts na pasta `sql/` na ordem abaixo para configurar seu ambiente (Supabase ou Postgres local):

1. `001-init-schema.sql` – Estrutura base
2. `003-presencas-auditoria-decisao.sql` – Auditoria de presenças
3. `004-turmas-aulas-softdelete.sql` – Soft delete
4. `005-tipos-treino-codigo.sql` – Códigos de treino
5. `006-presencas-aprovacao.sql` – Workflow de aprovação
6. `007-password-reset-tokens.sql` – Reset de senha
7. `008-usuarios-profile-fields.sql` – Campos de perfil
8. `009-academias-codigo.sql` – Códigos de academia
9. `010-academias-settings.sql` – Configurações
10. `011-redes.sql` – Estrutura de redes
11. `012-refresh-tokens.sql` – Tokens de refresh
12. `003-seed-faixas-e-regras-base.sql` – Padrão IBJJF
13. `002-seed-demo-completa.sql` – Dados de demonstração

---

## 🔐 Endpoints de Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/v1/auth/login` | Login com email/senha |
| POST | `/v1/auth/signup` | Cadastro self-service (código da academia) |
| POST | `/v1/auth/register` | Cadastro via convite individual |
| GET | `/v1/auth/academia/:codigo` | Valida código de academia |
| GET | `/v1/auth/convite/:codigo` | Valida convite individual |
| POST | `/v1/auth/forgot-password` | Solicita código OTP |
| POST | `/v1/auth/verify-otp` | Valida código OTP |
| POST | `/v1/auth/reset-password` | Redefine senha com OTP |
| POST | `/v1/auth/refresh` | Renova tokens |
| GET | `/v1/auth/me` | Dados do usuário autenticado |

---

## ✨ Funcionalidades Principais

- 🏢 **Multi-tenant**: Gestão de múltiplas academias de forma isolada.
- 👥 **Hierarquia de Papéis**: Perfis `ALUNO`, `INSTRUTOR`, `PROFESSOR`, `ADMIN` e `TI`.
- 🥋 **Check-in via QR Code**: Frequência garantida com tokens dinâmicos.
- 📅 **Gestão de Aulas**: Controle de turmas e geração automatizada de aulas em lote.
- 📊 **Dashboards Inteligentes**: Métricas em tempo real para alunos (progresso) e staff (KPIs).
- 🎓 **Regras de Graduação**: Cálculo automático de evolução baseado em presença e tempo.
- 🔒 **Segurança**: Proteção com Helmet, CORS, e Rate Limit global/por rota.

---

## 📄 Documentação (Swagger)

Acesse o Swagger UI para testar os endpoints em tempo real:
👉 `http://localhost:3000/v1/docs`

> [!TIP]
> **Fluxo de Autenticação**
>
> 1. Realize login em `POST /v1/auth/login`.
> 2. Copie o `accessToken` retornado.
> 3. Clique em **Authorize** (topo da página) e cole o seu token no campo JWT.

---

## 🧪 Quick Test (Seed Personas)

Use as credenciais abaixo para testar os fluxos pré-configurados:

- **Professor:** `professor.seed@example.com` / `SenhaProfessor123`
- **Aluno:** `aluno.seed@example.com` / `SenhaAluno123`

---

## 📦 Scripts Disponíveis

| Comando | Função |
| :--- | :--- |
| `npm run start:dev` | Inicia o servidor com hot-reload |
| `npm run build` | Transpila o código para produção (`dist/`) |
| `npm run test` | Executa testes unitários |
| `node scripts/apply-sql.js` | Sincroniza scripts SQL com o banco |

---

## 👨‍💻 Autor

Feito com 🥋 por **Bruno Alves Franca**.  
© 2025 Dojoro — Todos os direitos reservados.

---

## 📄 Licença

Este projeto é destinado a uso particular e está sob a licença [MIT](LICENSE).
