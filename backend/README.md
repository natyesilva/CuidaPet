# CuidaPet API

API REST inicial do CuidaPet para organizar pets, tratamentos prescritos, horários e aplicações de doses.

> O CuidaPet não calcula dosagens médicas e não substitui orientação veterinária. A dose deve ser informada pelo tutor exatamente conforme a prescrição do médico-veterinário.

## Stack

- .NET 8 e ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- FluentValidation
- Swagger/OpenAPI
- Clean Architecture com DDD básico

## Estrutura

```text
src/
  CuidaPet.Api             Controllers, autenticação, Swagger e middleware
  CuidaPet.Application     Casos de uso, DTOs, validações e abstrações
  CuidaPet.Domain          Entidades, enums e regras de negócio
  CuidaPet.Infrastructure  EF Core, PostgreSQL, repositórios, JWT e hash
```

## Pré-requisitos

- .NET SDK 8
- Docker Desktop, ou uma instância PostgreSQL compatível

## Banco de dados com Docker

Na pasta `backend`:

```bash
docker compose up -d
```

Configuração padrão:

- Database: `cuidapet_db`
- User: `cuidapet_user`
- Password: `cuidapet_password`
- Port: `5432`

## Configuração

A connection string padrão está em `src/CuidaPet.Api/appsettings.json`:

```text
Host=localhost;Port=5432;Database=cuidapet_db;Username=cuidapet_user;Password=cuidapet_password
```

Para produção, configure por variáveis de ambiente e use uma chave JWT secreta com pelo menos 32 bytes:

```text
ConnectionStrings__DefaultConnection
Jwt__Issuer
Jwt__Audience
Jwt__Key
Jwt__ExpirationMinutes
```

## Restaurar ferramentas e pacotes

```bash
dotnet tool restore
dotnet restore
```

## Migrations

Aplicar a migration existente:

```bash
dotnet tool run dotnet-ef database update --project src/CuidaPet.Infrastructure --startup-project src/CuidaPet.Api
```

Criar uma nova migration:

```bash
dotnet tool run dotnet-ef migrations add NomeDaMigration --project src/CuidaPet.Infrastructure --startup-project src/CuidaPet.Api --output-dir Persistence/Migrations
```

A migration inicial inclui:

- Tabelas de usuários, pets, medicamentos, tratamentos e doses
- Índices para consultas de agenda
- Seed de Prednisolona, Dipirona, Antibiótico, Vermífugo e Suplemento

## Executar

```bash
dotnet run --project src/CuidaPet.Api
```

Consulte o terminal para a URL local. O Swagger estará disponível em `/swagger` e o health check em `/health`.

Com a API e o banco em execução, rode o fluxo automatizado de validação:

```bash
node scripts/smoke-test.mjs
```

## Autenticação no Swagger

1. Execute `POST /api/auth/register`.
2. Copie o campo `token` da resposta.
3. Clique em **Authorize**.
4. Informe apenas o token JWT.
5. Teste as rotas protegidas.

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Pets

- `GET /api/pets`
- `GET /api/pets/{id}`
- `POST /api/pets`
- `PUT /api/pets/{id}`
- `DELETE /api/pets/{id}`

### Medications

- `GET /api/medications`
- `POST /api/medications`

### Treatments

- `GET /api/treatments`
- `GET /api/treatments/{id}`
- `POST /api/treatments`
- `PUT /api/treatments/{id}/cancel`
- `PUT /api/treatments/{id}/finish`

Ao criar um tratamento, a API gera uma dose em cada intervalo de `FrequencyHours`, incluindo `StartDate` e qualquer horário calculado até `EndDate`.

### Doses

- `GET /api/doses/today` (aceita `?date=` com offset para considerar o fuso do cliente)
- `GET /api/doses/pending`
- `PUT /api/doses/{id}/apply`
- `PUT /api/doses/{id}/skip`

## Segurança e regras

- Senhas armazenadas com hash usando `PasswordHasher`
- Rotas de negócio protegidas por JWT
- Acesso restrito aos pets, tratamentos e doses do usuário autenticado
- Dose aplicada não pode ser aplicada novamente
- Somente doses pendentes podem ser aplicadas ou ignoradas
- Agenda persistida e indexada, pronta para um worker futuro de push notifications
- DTOs separados das entidades de domínio
- Erros retornados em formato padronizado
