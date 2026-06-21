# CuidaPet — Landing Page

Landing page responsiva criada para validar o interesse em um aplicativo de organização de medicamentos e tratamentos para pets.

## Tecnologias

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React

## Executar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente `http://localhost:5173`.

## Gerar versão de produção

```bash
npm run build
npm run preview
```

Os arquivos de produção serão gerados no diretório `dist`.

## Formulário

Nesta etapa não há backend. Ao enviar o formulário, os dados são exibidos no console do navegador e uma confirmação é apresentada na tela.

O ponto de integração futura está no método `handleSubmit` do componente `src/sections/Waitlist.tsx`.

## Publicação na Vercel

1. Envie o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Mantenha o preset `Vite`.
4. Use `npm run build` como comando de build.
5. Use `dist` como diretório de saída.
