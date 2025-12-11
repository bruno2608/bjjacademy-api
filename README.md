# BJJAcademy API v1

Backend em NestJS para autenticacao, dashboards, check-ins e gestao academica da BJJAcademy/Codex. Fase atual entrega arquitetura base, rotas mockadas e documentacao Swagger.

## Referencias
- Especificacao completa: `docs/00-api-v1-spec.md`.

## Como rodar
```bash
npm install
npm run start:dev
```

- API: http://localhost:3000/v1
- Swagger/OpenAPI: http://localhost:3000/v1/docs

## Configuracao de banco (Supabase / Postgres)
- Defina `DATABASE_URL` no formato do Postgres (ex.: `postgresql://usuario:senha@host:5432/banco`).
- O `DatabaseService` detecta conexoes locais (`localhost` ou `127.0.0.1`) e desativa SSL. Para hosts remotos (ex.: Supabase), SSL fica ativo com `rejectUnauthorized: false`, evitando erros de certificado self-signed sem ajustes adicionais no .env.

## Contrato de login
`POST /v1/auth/login` espera apenas:
```json
{
  "email": "aluno.seed@example.com",
  "senha": "SenhaAluno123"
}
```

## Notas
- Respostas estao mockadas/TODO; ainda nao ha integracao real com banco ou provedores externos.
- Roles com suporte a `TI` + JWT configurados via guards e decorators.
