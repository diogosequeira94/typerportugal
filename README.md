# Type R Garage Portugal

## Ativar registo e área de membros (Supabase)

1. Cria um projeto em [Supabase](https://supabase.com/dashboard).
2. No **SQL Editor**, executa todo o conteúdo de `supabase/schema.sql`.
3. Em **Authentication → URL Configuration**, define o URL do site como `https://typerportugal.vercel.app` e adiciona `https://typerportugal.vercel.app/auth/callback` aos Redirect URLs.
4. No Vercel, adiciona estas variáveis a Production, Preview e Development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUBSTITUIR
```

Os valores estão em **Supabase → Project Settings → API Keys**. Para desenvolvimento local, copia `.env.example` para `.env.local` e substitui os valores.

O schema ativa Row Level Security: cada membro só pode alterar os próprios carros e fotografias; visitantes apenas conseguem consultar carros publicados.

### Aprovação de membros e carros

- O registo pede o número de WhatsApp e cria a conta como **Pendente**.
- O administrador compara o número com os membros do grupo e aprova ou rejeita o pedido no painel.
- Apenas membros aprovados conseguem submeter carros e fotografias.
- Carros novos e alterações feitas pelos proprietários ficam **Pendentes** até o administrador os aprovar e publicar.
- Rejeitar o acesso de um membro retira os carros desse membro da área pública.

Sempre que este ficheiro de schema for atualizado, pode ser executado novamente no SQL Editor para aplicar as novas políticas.

### Promover a conta mestra

Cria primeiro a tua conta normalmente no site. Depois executa no **SQL Editor** do Supabase, substituindo o email:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'O-TEU-EMAIL';
```

Termina sessão e volta a entrar. A conta passa a mostrar a área **Administração**, onde pode consultar, editar e remover carros de qualquer membro. A palavra-passe nunca fica guardada no código.

## Desenvolvimento

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Email and name are intended for display or contact purposes.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
