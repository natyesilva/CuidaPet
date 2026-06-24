# Testes do CuidaPet

Este documento descreve a pirâmide de testes automatizados do MVP do CuidaPet.

## Visão geral

O projeto usa três camadas principais:

| Camada | Ferramenta | Objetivo |
| --- | --- | --- |
| Unitários | Vitest | Validar regras puras e funções sem renderizar telas |
| Integração/componentes | Vitest + Testing Library | Validar interação de componentes React |
| E2E | Playwright | Validar fluxos reais no navegador |

## Comandos

Executar tudo:

```bash
npm test
```

Executar por camada:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Modo observação durante desenvolvimento:

```bash
npm run test:watch
```

Antes de fechar uma entrega, rode também:

```bash
npm run lint
npm run build
```

## Estrutura

```text
tests/
  setup.ts
  unit/
  integration/
  e2e/
```

- `tests/setup.ts`: configura Testing Library, matchers do `jest-dom` e limpeza automática entre testes.
- `tests/unit`: testes de funções puras.
- `tests/integration`: testes de componentes e interações de UI.
- `tests/e2e`: testes Playwright de ponta a ponta.

## O que já está coberto

### Unitários

Arquivos:

- `tests/unit/speciesOptions.test.ts`
- `tests/unit/weight.test.ts`
- `tests/unit/date.test.ts`
- `tests/unit/notificationService.test.ts`

Coberturas principais:

- opções dependentes de grupo, espécie popular e espécie específica;
- compatibilidade com dados antigos de pets via inferência de grupo;
- normalização de texto com acentos e caixa;
- conversão e formatação de peso em `kg` e `g`;
- cálculo de datas relativas para histórico e controle de peso;
- geração de ID numérico estável para notificações locais do Android.

### Integração/componentes

Arquivos:

- `tests/integration/PetForm.test.tsx`
- `tests/integration/AuthPage.test.tsx`

Coberturas principais:

- cadastro de pet filtra opções compatíveis por dependência:
  - grupo do animal;
  - espécie popular;
  - espécie específica;
- troca do grupo limpa os campos filhos;
- combinações incompatíveis são bloqueadas quando não estão no modo `Outro`;
- texto livre é permitido quando o usuário seleciona `Outro`;
- tela de login não exibe o aviso visual do acesso de demonstração;
- login continua enviando `Test` e `Admin123` para o fluxo de autenticação.

### E2E

Arquivo:

- `tests/e2e/app-smoke.spec.ts`

Coberturas principais:

- landing page continua abrindo em `/`;
- fluxo `Test` / `Admin123` entra no app e redireciona para `/app/home`;
- o aviso visual de demonstração não aparece na tela de login.

O teste E2E usa variáveis fake do Supabase no `playwright.config.ts`, porque o objetivo é validar o fluxo da UI sem depender do banco real. O logout técnico do modo local é interceptado no teste para evitar chamada externa desnecessária.

## Configuração do Playwright

Na primeira execução em uma máquina nova, instale o navegador usado nos testes:

```bash
npx playwright install chromium
```

O Playwright sobe o Vite automaticamente com:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

As variáveis de ambiente de teste ficam definidas em `playwright.config.ts`.

## Boas práticas para novos testes

- Regra pura nova: teste em `tests/unit`.
- Componente com interação: teste em `tests/integration`.
- Fluxo crítico de usuário: teste em `tests/e2e`.
- Evite depender do Supabase real em testes automatizados locais.
- Prefira testar comportamento visível para o usuário, não classes CSS internas.
- Para fluxos de saúde dos pets, não crie testes que assumam cálculo automático de dosagem veterinária. A dose deve continuar sendo manual.

## Checklist antes de abrir PR

```bash
npm test
npm run lint
npm run build
```

