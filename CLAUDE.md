# CLAUDE.md — CuidaPet

## Antes de explorar o código
1. Leia `docs/AI_CONTEXT.md` (arquitetura, modelo de dados, fluxos, riscos, regras).
2. Só depois abra arquivos, e apenas os necessários para a tarefa.
3. Use buscas direcionadas (grep/glob); evite ler `AppDataProvider.tsx` inteiro (~1100 linhas).
4. Ignore `node_modules`, `dist`, `android/app/build`, `coverage`, `*.tsbuildinfo`.
5. `backend/` (.NET) não é usado pelo app; não altere sem pedido explícito.

## Stack resumida
React 18 + TS + Vite + Tailwind + Capacitor 7 (Android) + Supabase (Auth + Postgres/RLS).
Notificações locais: `src/app/features/notifications/notificationService.ts`.

## Regras
- Não leia nem exponha `.env`, chaves ou credenciais.
- Alterações de schema: atualizar `supabase/*.sql`, `src/lib/database.types.ts` e tipos do front.
- Novas tabelas sempre com `user_id` + RLS `auth.uid() = user_id`.
- Manter o modo demo (localStorage) coerente com o fluxo Supabase em `AppDataProvider`.
- O app nunca calcula dosagem; apenas registra a prescrição veterinária.
- Suporte a espécies exóticas é requisito (não assumir cão/gato; peso em g ou kg).
- Textos de UI em pt-BR.
- Antes de commitar: `npm run lint` e `npm run test:unit`.
- Ao concluir mudanças relevantes de arquitetura, atualize `docs/AI_CONTEXT.md` (máx. 150 linhas).

## Comandos
`npm run dev` · `npm run build` · `npm test` · `npm run android:sync` · `npm run android:open`
