# CuidaPet — Landing Page

Landing page responsiva para validar o interesse no CuidaPet, com lista de espera integrada diretamente ao Supabase.

## Tecnologias

- React
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React

## Pré-requisitos

- Node.js 18 ou superior
- Tabela `waitlist` criada no Supabase
- Acesso de inserção configurado para a chave pública

## Configurar as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
copy .env.example .env.local
```

No macOS ou Linux:

```bash
cp .env.example .env.local
```

O arquivo deve conter:

```env
VITE_SUPABASE_URL=https://zxvkptjwhykkvqulotra.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publicavel
```

Variáveis com o prefixo `VITE_` ficam disponíveis no navegador. Utilize apenas a chave pública/publicável do Supabase. Nunca coloque uma chave `service_role` no frontend.

## Configurar a tabela no Supabase

A integração espera a tabela `public.waitlist` com estas colunas:

| Coluna | Tipo |
| --- | --- |
| `id` | `uuid` |
| `name` | `text` |
| `email` | `text` |
| `pets_count` | `text` |
| `main_problem` | `text` |
| `created_at` | `timestamp` |

Se o Row Level Security estiver ativo, crie uma política que permita somente inserções públicas:

```sql
create policy "allow public waitlist inserts"
on public.waitlist
for insert
to anon
with check (true);
```

Não é necessário liberar `SELECT` para o papel `anon`. Assim, visitantes podem entrar na lista, mas não conseguem consultar os leads cadastrados.

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Testar a integração

1. Confirme que `.env.local` possui a URL e a chave pública corretas.
2. Verifique no Supabase se a política de `INSERT` está ativa.
3. Abra a landing page e preencha o formulário da lista de espera.
4. Confirme a mensagem de sucesso na página.
5. No Supabase, abra **Table Editor → waitlist** e verifique o novo registro.

Em caso de falha, o formulário mantém os dados preenchidos e exibe uma mensagem amigável para nova tentativa.

## Validar a aplicação

```bash
npm run lint
npm run build
npm run preview
```

Os arquivos de produção são gerados no diretório `dist`.

## Publicação na Vercel

1. Envie o projeto para um repositório Git.
2. Importe o repositório na Vercel usando o preset **Vite**.
3. Em **Settings → Environment Variables**, cadastre:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Use `npm run build` como comando de build.
5. Use `dist` como diretório de saída.
6. Faça um novo deploy após alterar variáveis de ambiente.

O frontend grava os leads diretamente no Supabase e não depende do backend .NET.
