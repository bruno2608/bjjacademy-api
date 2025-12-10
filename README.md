# BJJAcademy API v1

Backend em NestJS para autenticação, dashboards, check-ins e gestão acadêmica da BJJAcademy/Codex. Esta fase entrega a arquitetura base, rotas mockadas e documentação Swagger.

## Referências
- Especificação completa: `docs/00-api-v1-spec.md`.

## Como rodar
```bash
npm install
npm run start:dev
```

- API: http://localhost:3000/v1
- Swagger/OpenAPI: http://localhost:3000/v1/docs

## Notas
- Respostas estão mockadas/TODO; não há integração real com banco ou provedores externos.
- Roles com suporte a `TI` + JWT configurados via guards e decorators.
