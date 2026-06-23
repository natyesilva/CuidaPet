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

Depois de aplicar o SQL, entre no app com uma conta real do Supabase. Cadastros e alterações serão persistidos no banco e ficarão isolados por usuário.

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

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são incorporadas ao bundle durante `npm run build`; confirme que o `.env.local` está configurado antes da sincronização.

### Próximos passos nativos

- criar ícone e splash screen próprios;
- configurar assinatura para APK/AAB de produção;
- implementar deep links para confirmação de e-mail do Supabase;
- adicionar notificações locais para doses;
- remover o acesso local de demonstração antes de uma publicação de produção.
