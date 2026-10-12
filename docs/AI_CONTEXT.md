# CuidaPet — Contexto para IA

## Objetivo e stack
App Android para tutores organizarem pets (incl. exóticos), peso, vacinas, tratamentos e doses, com lembretes locais.
O mesmo bundle web serve a landing page (Vercel: https://cuidapet.vercel.app) e o app (Capacitor).
- React 18 + TypeScript 5.6 + Vite 6 + Tailwind 3 + react-router-dom 7 + lucide-react.
- Capacitor 7 (`appId br.com.cuidapet.app`, `webDir dist`) + `@capacitor/local-notifications`.
- Supabase (`@supabase/supabase-js`): Auth (email/senha) + Postgres com RLS. Sem Edge Functions.
- Testes: Vitest + Testing Library + Playwright (ver `docs/testing.md`).
- `backend/` (.NET 8, EF Core, JWT): API REST legada/experimental. **Não é usada pelo frontend.**

## Estrutura
```
src/main.tsx            entrada -> AppRouter
src/App.tsx             landing page (monta src/sections/* e src/components/*)
src/sections/           seções da landing; Waitlist.tsx grava em tabela `waitlist`
src/lib/supabase.ts     client Supabase (env VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY; lança erro se ausente)
src/lib/database.types.ts tipos gerados do banco
src/app/routes/AppRouter.tsx  rotas, guards, splash nativo
src/app/layout/AppShell.tsx   layout com navegação do app
src/app/features/<feature>/   páginas: auth, home, pets, treatments, doses, profile, splash, notifications
src/app/services/       acesso ao Supabase por tabela (+ speciesOptions.ts: catálogo de espécies)
src/app/shared/         AppDataProvider (estado global), contextos, utils (date, weight, pet, errors, ui)
supabase/app-schema.sql schema completo + RLS; pets-exotic-migration.sql = migração incremental
android/                projeto nativo Capacitor (manifest com POST_NOTIFICATIONS e SCHEDULE_EXACT_ALARM)
tests/{unit,integration,e2e}
```

## Arquivos-chave
- `AppRouter.tsx`: `/` = landing no web; no nativo redireciona p/ `/app/home` ou `/app/login`.
  Públicas: `/app/login`, `/app/register`; sem guard: `/app/forgot-password`, `/app/reset-password`. Protegidas (AppShell): `home, pets, pets/new, pets/:petId,
  treatments, treatments/new, today, history, profile`. Splash nativo mínimo de 1,4s.
- `features/auth/AuthProvider.tsx`: sessão Supabase, signIn/signUp/signOut, recuperação de senha, **modo demo**.
- `features/auth/PasswordRecoveryPage.tsx` + `passwordRecovery.ts`: esqueci a senha (link ou código OTP).
- `shared/AppDataProvider.tsx` (~1100 linhas): carrega todos os dados, expõe CRUD (addPet, updatePet,
  deletePet, addTreatment, changeTreatmentStatus, deleteTreatment, updateDoseStatus, addWeight,
  add/update/deleteVaccine, syncNotifications). Tem ramo duplicado para modo demo (localStorage).
- `shared/app-data-context.ts`: tipos de domínio do front (Pet, Treatment, Dose, Vaccine...).
- `services/*Service.ts`: queries Supabase; mapeiam snake_case -> camelCase no provider.
- `features/notifications/notificationService.ts`: toda a lógica de notificações locais.
- `features/profile/ProfilePage.tsx`: permissões, sync/teste de notificações, logout.
- `features/pets/PetForm.tsx` + `SpeciesCombobox.tsx` + `services/speciesOptions.ts`: cadastro com espécies exóticas.

## Modelo de dados (Supabase, schema public)
Todas as tabelas: `user_id -> auth.users` (cascade), RLS ativa com políticas `auth.uid() = user_id` (CRUD).
- `pets`: name, animal_group, species, specific_species, subspecies_or_morph, breed, sex,
  weight_kg, weight_unit ('kg'|'g', exibição; valor sempre em kg), birth_date, notes.
- `treatments`: pet_id, medication_name, dose, dose_unit, frequency_hours>0, start_at, end_at>start_at,
  instructions, veterinarian_name, status (texto livre; app usa active/completed/cancelled).
- `dose_schedules`: treatment_id, pet_id, scheduled_at, status (pending|applied|skipped|missed), applied_at, notes.
- `pet_weight_records`: pet_id, weight_kg>0, recorded_at (date), notes.
- `pet_vaccines`: pet_id, name, applied_at, next_due_at, veterinarian_name, clinic_name, notes.
- `waitlist`: usada pela landing, **não consta em supabase/*.sql**.
Trigger `set_updated_at` em pets, treatments, pet_vaccines. Deletes de pet/tratamento cascateiam.

## Fluxos principais
1. Auth: login/cadastro via Supabase (`persistSession` em localStorage, `detectSessionInUrl:false`).
   Esqueci a senha: `resetPasswordForEmail` (redirectTo = `VITE_PUBLIC_SITE_URL` ou origem web) ->
   (a) link abre `/app/reset-password` no navegador (tokens no hash são lidos manualmente; `/` com
   `type=recovery` redireciona) ou (b) código digitado no app (`verifyOtp` type recovery, exige
   `{{ .Token }}` no template de e-mail) -> `updateUser({ password })`.
2. Pets: lista -> novo (PetForm) -> detalhe (editar, registrar peso, CRUD de vacinas) -> excluir.
3. Tratamento: `treatmentsService.create` insere treatment e **gera no cliente** todas as doses
   (start..end a cada frequency_hours), inserindo em lotes de 500; em falha, apaga o treatment (rollback manual).
   Em seguida agenda notificações das doses futuras.
4. Hoje (`today`): doses do dia; marcar aplicada/pulada (`updateDoseStatus`) cancela a notificação da dose.
5. Histórico: doses applied/skipped (limit 200).
6. Concluir/cancelar/excluir tratamento cancela notificações do tratamento.

## Notificações e persistência
- Só em plataforma nativa (`Capacitor.isNativePlatform()`); no web retornam `supported:false`.
- Canal Android `cuidapet-medication-reminders` (importância alta); ícone `ic_stat_cuidapet`.
- ID da notificação = hash FNV-1a do `doseScheduleId` (31 bits). `extra.source='cuidapet-dose-reminder'`
  distingue as do app; `allowWhileIdle: true`.
- `syncPendingNotifications(doses)`: com permissão, compara pendentes no aparelho com doses futuras
  `pending` do banco (`listFuturePending`), agenda as faltantes e cancela as órfãs. Chamado ao carregar
  dados (refreshData) e manualmente no Perfil. Sem permissão: não agenda nada.
- Permissões: POST_NOTIFICATIONS e exact alarm solicitadas pelo Perfil.
- Persistência: Supabase é a fonte da verdade; não há cache offline. localStorage guarda sessão
  Supabase, flag `cuidapet:demo-session` e dados demo `cuidapet:demo-data`.

## Status das funcionalidades
Confirmadas: auth email/senha; recuperação de senha; CRUD pets c/ espécies exóticas e unidade g/kg; histórico de peso;
CRUD vacinas; tratamentos c/ geração de doses; agenda do dia; histórico; notificações locais de doses;
modo demo; landing + waitlist; testes unit/integration/e2e.
Parciais:
- Vacinas: `next_due_at` é salvo/exibido, mas **não gera lembrete**.
- Status `missed`: existe no schema/tipos, mas nada marca doses atrasadas como `missed`.
- Edição de tratamento: só status (concluir/cancelar) e exclusão; sem editar campos.
- Login social: não encontrado.
Pendentes/inexistentes: modo offline, notificações push remotas, compartilhamento familiar
(só citado na landing — `FamilyFeature.tsx`), anexos/fotos de pets, iOS.

## Comandos
- `npm run dev` | `npm run build` (tsc -b && vite build) | `npm run lint` | `npm run preview`
- Testes: `npm test`, `npm run test:unit|test:integration|test:e2e|test:coverage`
- Android: `npm run android:sync` (build + cap sync), `android:open`, `android:run`,
  `android:apk` (usa `gradlew.bat` -> só Windows; em Linux/mac use `./gradlew assembleDebug`).
- Schema: executar `supabase/app-schema.sql` no SQL editor (idempotente).
- Backend .NET: ver `backend/README.md` (fora do fluxo do app).

## Riscos técnicos
- **Credencial demo hardcoded** (`test` / senha fixa em AuthProvider) no bundle de produção.
- Sem limite de notificações agendadas: tratamentos longos/frequentes podem exceder o limite do
  Android (~500 alarmes por app); restauração após reboot depende do plugin (não verificado em aparelho).
- Geração de doses no cliente sem transação: rollback manual pode deixar lixo em falha de rede.
- `AppDataProvider` monolítico com lógica duplicada demo/Supabase -> mudanças precisam tocar os dois ramos.
- Carrega todos os dados do usuário em memória; sem paginação (exceto histórico 200).
- Tabela `waitlist` e suas políticas fora do versionamento SQL.
- `vite.config.js` e `vite.config.ts` coexistem (o .js é mínimo); risco de config divergente.
- Fusos: datas `date` vs `timestamptz` (ver `shared/date.ts`) — cuidado com off-by-one.
- `status` de treatments sem CHECK no banco.
- `backend/` .NET pode confundir: não está integrado.

## Regras para alterações
- Toda mudança de dados: atualizar `supabase/app-schema.sql` (idempotente) + migração incremental
  em `supabase/` + `src/lib/database.types.ts` + tipos em `app-data-context.ts` + mapeamentos no provider.
- Novas tabelas: sempre `user_id` + RLS com `auth.uid() = user_id`.
- Manter o ramo demo do `AppDataProvider` coerente com o ramo Supabase.
- Ao mudar doses/tratamentos, manter sincronia com notificações (agendar/cancelar por doseScheduleId).
- Nunca calcular dosagem: o app só registra a prescrição do veterinário.
- Espécies: estender `services/speciesOptions.ts`; não assumir cão/gato; peso pode ser em gramas.
- Não ler/commitar `.env`; variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_SITE_URL` (opcional).
- Rodar `npm run lint` e `npm run test:unit` antes de commitar; UI em pt-BR.
