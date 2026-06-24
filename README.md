# CuidaPet — Landing page e aplicativo MVP

O projeto reúne duas experiências no mesmo frontend React:

- `/` — landing page pública com a lista de espera existente;
- `/app` — aplicativo mobile-first com autenticação e telas iniciais do produto.

## Tecnologias

- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Supabase Auth e banco da lista de espera
- Lucide React
- Capacitor 7 para Android
- Capacitor Camera para foto dos pets
- Capacitor Local Notifications para lembretes de doses
- Vitest, Testing Library e Playwright para testes automatizados

## Pré-requisitos

- Node.js 20 ou superior;
- um projeto Supabase;
- a tabela `public.waitlist` configurada;
- autenticação por e-mail e senha habilitada no Supabase.

## Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
copy .env.example .env.local
```

No macOS ou Linux:

```bash
cp .env.example .env.local
```

Configure:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publicavel
```

Use somente a chave pública/publicável (`anon` ou `publishable`) no frontend. Nunca exponha a chave `service_role`.

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente:

- landing: `http://localhost:5173/`
- aplicativo: `http://localhost:5173/app`
- login direto: `http://localhost:5173/app/login`

## Autenticação do aplicativo

O MVP usa o Supabase Auth para:

- cadastro com e-mail e senha;
- login com e-mail e senha;
- persistência e renovação da sessão;
- logout.

O APK também possui um acesso local de demonstração, sem privilégios no Supabase:

```text
Usuário: Test
Senha: Admin123
```

Esse modo mantém dados de exemplo apenas no armazenamento local do aparelho e não deve ser tratado como uma conta administrativa de produção.

Em **Supabase → Authentication → Providers**, mantenha o provedor de e-mail habilitado. Se a confirmação de e-mail estiver ativa, o usuário precisará confirmar o endereço antes do primeiro login.

Para contas autenticadas pelo Supabase, pets, tratamentos, agenda, histórico, pesos e vacinas usam dados reais das tabelas `pets`, `treatments`, `dose_schedules`, `pet_weight_records` e `pet_vaccines`. As chamadas estão centralizadas em `src/app/services`, e os componentes consomem a camada `AppDataProvider`.

O acesso local `Test`/`Admin123` continua isolado como demonstração e não lê nem grava dados no Supabase.

## Configurar o banco do aplicativo

O schema completo está em:

```text
supabase/app-schema.sql
```

Para aplicá-lo:

1. abra **Supabase → SQL Editor**;
2. crie uma nova query;
3. copie todo o conteúdo de `supabase/app-schema.sql`;
4. execute a query;
5. confirme no **Table Editor** a criação de:
   - `pets`;
   - `treatments`;
   - `dose_schedules`;
   - `pet_weight_records`;
   - `pet_vaccines`.

O script também cria índices, validações, atualização automática de `updated_at`, ativa Row Level Security e adiciona policies para `select`, `insert`, `update` e `delete` limitadas por `auth.uid() = user_id`.

Se você já executou uma versão anterior do schema, pode rodar `supabase/app-schema.sql` novamente. O script adiciona os novos campos opcionais de pets sem apagar dados existentes:

- `photo_url`;
- `approximate_age`;
- `approximate_age_unit`.

Depois de aplicar o SQL, entre no app com uma conta real do Supabase. Cadastros e alterações serão persistidos no banco e ficarão isolados por usuário.

### Modelo de cadastro de pets

A tabela `pets` mantém compatibilidade com dados antigos: o campo `species` continua existindo e não foi removido. Para suportar animais exóticos, o app também usa campos opcionais de classificação:

| Campo | Uso |
| --- | --- |
| `animal_group` | categoria geral, como `Réptil`, `Ave`, `Roedor/Pequeno mamífero` ou `Cachorro/Gato` |
| `species` | espécie popular ou tipo principal, como `Cobra`, `Lagarto`, `Calopsita`, `Cachorro` |
| `specific_species` | espécie específica, como `Corn snake`, `Píton-real`, `Gecko leopardo` |
| `subspecies_or_morph` | subespécie, morfo, linhagem ou variação, como `Albina`, `Lutino`, `Dumbo` |
| `breed` | raça ou tipo quando fizer sentido |
| `sex` | sexo informado livremente |
| `photo_url` | URL pública da foto do pet no Supabase Storage |
| `birth_date` ou `approximate_age` + `approximate_age_unit` | o formulário pede escolher uma das duas formas de informar idade |
| `weight_kg` + `weight_unit` | peso atual obrigatório no formulário, normalizado em kg e com unidade preferida para exibição |

Todos os campos de classificação no app funcionam como autocomplete livre: as sugestões ajudam, mas não bloqueiam textos personalizados. Se o schema antigo já foi executado, pode executar novamente o arquivo `supabase/app-schema.sql`; ele usa `add column if not exists` para adicionar os novos campos sem apagar registros existentes.

Se você já tem as tabelas antigas criadas e quer aplicar apenas os novos campos de pets, execute o arquivo menor:

```text
supabase/pets-exotic-migration.sql
```

### Fotos dos pets

O app salva no banco apenas a URL da imagem, no campo `pets.photo_url`. A imagem deve ficar no Supabase Storage.

Bucket usado pelo app:

```text
pet-photos
```

O arquivo `supabase/app-schema.sql` já cria esse bucket como público para leitura e adiciona policies para usuários autenticados enviarem, atualizarem e removerem arquivos dentro da própria pasta `{user_id}`.

Se as tabelas já existem e você precisa corrigir apenas o envio de fotos, execute somente:

```text
supabase/pet-photos-storage.sql
```

Se preferir aplicar apenas a configuração de Storage manualmente, use:

```sql
insert into storage.buckets (id, name, public, file_size_limit)
values ('pet-photos', 'pet-photos', true, 10485760)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

create policy "Users can upload pet photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own pet photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read pet photos"
on storage.objects
for select
to public
using (bucket_id = 'pet-photos');
```

As fotos são enviadas para caminhos no formato:

```text
{user_id}/{pet_id}/{arquivo}
```

O app não salva base64 no banco.

## Rotas do MVP

| Rota | Tela |
| --- | --- |
| `/app/login` | Login |
| `/app/register` | Cadastro |
| `/app/home` | Resumo |
| `/app/pets` | Lista de pets |
| `/app/pets/new` | Cadastro de pet |
| `/app/pets/:petId` | Detalhe do pet, tratamentos, vacinas e histórico de peso |
| `/app/treatments` | Lista de tratamentos |
| `/app/treatments/new` | Cadastro de tratamento |
| `/app/today` | Agenda de doses do dia |
| `/app/history` | Histórico |
| `/app/profile` | Perfil e logout |

As rotas internas são protegidas. Sem uma sessão válida, o usuário é redirecionado para `/app/login`.

## Lista de espera

A landing continua gravando diretamente na tabela `public.waitlist` com as colunas:

| Coluna | Tipo |
| --- | --- |
| `id` | `uuid` |
| `name` | `text` |
| `email` | `text` |
| `pets_count` | `text` |
| `main_problem` | `text` |
| `created_at` | `timestamp` |

Com Row Level Security ativo, permita somente inserções públicas:

```sql
create policy "allow public waitlist inserts"
on public.waitlist
for insert
to anon
with check (true);
```

Não é necessário liberar `SELECT` para visitantes.

## Validar a aplicação

```bash
npm run lint
npm run build
npm run preview
```

O `vercel.json` contém o rewrite necessário para que URLs como `/app/today` abram diretamente sem retornar 404 na Vercel.

## Pirâmide de testes

O MVP possui uma pirâmide de testes automatizados documentada em:

```text
docs/testing.md
```

Resumo das camadas:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

Também é possível executar a pirâmide completa:

```bash
npm test
```

- **Unitários**: validam regras puras como opções dependentes de espécies, peso, datas e IDs numéricos de notificações.
- **Integração/componentes**: validam interações de tela, como o cadastro de pet com campos dependentes e o login sem exibir o acesso de demonstração.
- **E2E**: usa Playwright para validar a landing em `/` e o fluxo de login `Test`/`Admin123` até `/app/home`.
- **Coverage**: usa Vitest com provider `v8` e gera relatórios em texto, HTML e `json-summary`.

Para medir cobertura:

```bash
npm run test:coverage
```

O relatório HTML fica em:

```text
coverage/index.html
```

O diretório `coverage/` é gerado localmente e não deve ser commitado.

## Checklist manual do MVP

A primeira rodada com uma usuária real deve ser acompanhada pelo checklist:

```text
TESTES_MVP.md
```

Esse documento organiza a validação funcional do MVP instalado no Android, cobrindo:

- autenticação;
- cadastro de pets;
- registro de peso;
- vacinas;
- tratamentos;
- agenda;
- histórico;
- notificações locais;
- perguntas de feedback da usuária;
- registro de bugs encontrados.

Use esse checklist antes de liberar o app para mais usuários. A ideia é preencher o status de cada cenário, anotar dúvidas, registrar bugs e decidir se a versão pode avançar para uma nova rodada de testes.

Na primeira execução local do Playwright, se o navegador ainda não estiver instalado, rode:

```bash
npx playwright install chromium
```

Checklist recomendada antes de abrir PR ou gerar uma nova versão:

```bash
npm test
npm run lint
npm run build
```

## Deploy na Vercel

1. Importe o repositório usando o preset **Vite**.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Use `npm run build` como comando de build.
4. Use `dist` como diretório de saída.
5. Faça um novo deploy depois de alterar variáveis de ambiente.

## Aplicativo Android com Capacitor

O projeto Android já está configurado com:

- nome: `CuidaPet`;
- application ID: `br.com.cuidapet.app`;
- assets web: diretório `dist`;
- código nativo: diretório `android`;
- SDK mínimo: Android 6, API 23;
- SDK de compilação e destino: API 35.

Ao abrir o aplicativo nativo, a rota inicial redireciona automaticamente para `/app`. A landing continua sendo a rota inicial apenas na versão web.

### Pré-requisitos Android

- JDK 21;
- Android Studio;
- Android SDK Platform 35;
- Android SDK Build-Tools;
- um emulador configurado ou celular Android com depuração USB habilitada.

O Android Studio normalmente inclui um JDK 21 compatível. Se o terminal continuar usando uma versão antiga, ajuste `JAVA_HOME` para o diretório `jbr` da instalação do Android Studio.

### Sincronizar o projeto Android

Sempre que o código React mudar:

```bash
npm run android:sync
```

Esse comando gera o build web e copia o conteúdo de `dist` para o projeto Android.

Depois de instalar ou atualizar plugins do Capacitor, como câmera ou notificações, rode também esse comando para atualizar os arquivos nativos.

### Abrir no Android Studio

```bash
npm run android:open
```

No Android Studio, aguarde o Gradle sincronizar, selecione um emulador ou celular conectado e pressione **Run**.

### Rodar em um celular conectado

Com a depuração USB ativa e o aparelho autorizado:

```bash
adb devices
npm run android:run
```

### Gerar um APK de debug

No Windows:

```bash
npm run android:apk
```

O APK será criado em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Notificações locais

No aplicativo Android, a criação de um tratamento agenda lembretes locais para
as doses futuras imediatamente, usando o canal Android `treatment-reminders`
com importância alta. O app solicita a permissão de notificações no primeiro
acesso após login ou antes do primeiro agendamento e permite consultar ou
sincronizar os lembretes na tela **Perfil**.

No Android 12 ou superior, também é recomendável permitir **alarmes e
lembretes exatos** nas configurações do CuidaPet. A versão web apresenta um
fallback informativo e não agenda notificações no navegador.

Permissões Android usadas:

- `POST_NOTIFICATIONS`: necessária no Android 13+ para exibir notificações.
- `SCHEDULE_EXACT_ALARM`: usada para melhorar a precisão dos lembretes de remédio quando o usuário permite alarmes exatos.

O app não usa `USE_EXACT_ALARM` nesta versão. Se o Android negar alarmes
exatos, os lembretes continuam sendo agendados, mas podem sofrer atraso por
políticas do sistema, economia de bateria ou modo Doze.

Teste manual recomendado no Android real:

1. Instale um APK limpo.
2. Faça login e permita notificações.
3. Crie um pet.
4. Crie um tratamento com dose para daqui 2 minutos.
5. Feche o app e bloqueie o celular.
6. Confirme se a notificação aparece no horário.
7. Reabra o app, sincronize lembretes no Perfil e confira se a contagem não duplicou.

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são incorporadas ao bundle durante `npm run build`; confirme que o `.env.local` está configurado antes da sincronização.

### Próximos passos nativos

- criar ícone e splash screen próprios;
- configurar assinatura para APK/AAB de produção;
- implementar deep links para confirmação de e-mail do Supabase;
- remover o acesso local de demonstração antes de uma publicação de produção.
