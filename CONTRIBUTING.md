# Guia de Contribuição

Obrigado por considerar contribuir com a **Dojoro API**! 🥋

## 📋 Índice

- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)

---

## Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dojoro-api.git
cd dojoro-api

# Instale as dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Configure as variáveis em .env
# DATABASE_URL=postgres://...
# JWT_SECRET=...

# Inicie o desenvolvimento
npm run start:dev
```

### Requisitos
- Node.js 18+
- npm 9+
- PostgreSQL 15+ (ou Supabase)

---

## Estrutura do Projeto

```
src/
├── modules/          # Módulos de domínio
│   ├── auth/         # Autenticação
│   ├── users/        # Usuários
│   ├── academias/    # Academias
│   ├── turmas/       # Turmas
│   ├── aulas/        # Aulas
│   ├── presencas/    # Presenças/Check-ins
│   └── ...
├── shared/           # Código compartilhado
│   ├── guards/       # Auth guards
│   ├── decorators/   # Custom decorators
│   └── filters/      # Exception filters
└── main.ts           # Entry point

sql/                  # Scripts SQL
tests/                # Testes
docs/                 # Documentação
```

---

## Padrões de Código

### NestJS
- Um módulo por feature
- Services para lógica de negócio
- Controllers apenas para HTTP handling
- DTOs para validação de entrada

### DTOs
```typescript
// ✅ Bom: DTO com validação e Swagger
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;
}
```

### SQL
- Use prepared statements (nunca concatene strings)
- Nomeie scripts com prefixo numérico: `019-seed-pendencias.sql`
- Comente queries complexas

---

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

### Formato
```
<tipo>(<escopo>): <descrição>
```

### Tipos
| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `refactor` | Refatoração sem mudar comportamento |
| `test` | Adição/correção de testes |
| `chore` | Tarefas de build, configs |

### Exemplos
```bash
feat(presencas): add endpoint for bulk approval
fix(auth): handle expired refresh token gracefully
docs(swagger): add examples to DTOs
```

---

## Pull Requests

### Antes de Abrir
- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm run test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Swagger atualizado para novos endpoints

### Template
```markdown
## Descrição
Breve descrição do que foi feito.

## Tipo de Mudança
- [ ] Nova feature
- [ ] Bug fix
- [ ] Refatoração

## Endpoints Afetados
- `POST /v1/presencas/:id/decisao`

## Como Testar
1. Faça login como professor
2. Acesse `GET /v1/presencas/pendencias`
3. ...
```

---

## Testes

```bash
# Rodar todos os testes
npm run test

# Rodar testes com watch
npm run test:watch

# Rodar testes de integração
npm run test:e2e
```

### Estrutura de Testes
```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração
└── fixtures/       # Dados de teste
```

---

## Swagger

A documentação da API está disponível em:

```
http://localhost:3000/v1/docs
```

Ao criar novos endpoints, sempre adicione:
- `@ApiTags('nome-modulo')`
- `@ApiOperation({ summary: '...' })`
- `@ApiOkResponse({ type: ResponseDto })`

---

## Dúvidas?

Abra uma issue ou entre em contato com **Bruno Alves França**.

Oss! 🥋
