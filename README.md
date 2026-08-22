# Sincopados

Sitio y panel de gestión de Sincopados Producciones Audiovisuales, construido con
Nuxt, Nuxt UI y Supabase.

Consulta la [documentación de Nuxt](https://nuxt.com/docs/getting-started/introduction)
para el detalle del framework.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Despliegue en Netlify

Variables de entorno a configurar en Netlify (Site settings → Environment variables):

| Variable | Ámbito | Notas |
|---|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | Builds + Functions | Pública: viaja al navegador |
| `NUXT_PUBLIC_SUPABASE_KEY` | Builds + Functions | Clave publicable, pública por diseño |
| `NUXT_SUPABASE_SECRET_KEY` | **Sólo Functions** | Salta toda la RLS. Nunca debe llegar al navegador |

### Por qué la secret key no se hornea en el bundle

`@nuxtjs/supabase` lee `process.env.NUXT_SUPABASE_SECRET_KEY` en tiempo de build
y la coloca en `runtimeConfig`, que Nitro escribe literal dentro de
`.netlify/functions-internal/server/chunks/nitro/nitro.mjs`. El escáner de
secretos de Netlify lo detecta y falla el build, con razón.

Para evitarlo, `nuxt.config.ts` declara `runtimeConfig.supabase.secretKey: ''`.
Ese valor gana sobre el que el módulo toma del entorno, así que el bundle sale
con la cadena vacía y Nitro resuelve la clave real en cada arranque de la
función desde la variable de entorno. Verificado: la ruta `/api/admin/users`,
que usa `serverSupabaseServiceRole`, funciona sobre el build de producción sin
que la clave aparezca en ningún archivo del `.output`.

Las dos variables `NUXT_PUBLIC_*` sí tienen que estar en el bundle, por lo que
`netlify.toml` las excluye del escáner con `SECRETS_SCAN_OMIT_KEYS`. La secret
key se deja fuera de esa lista a propósito, para que el escáner siga
vigilándola.

### Base de datos

Las migraciones y el modelo de permisos están documentados en
[`supabase/README.md`](supabase/README.md).
