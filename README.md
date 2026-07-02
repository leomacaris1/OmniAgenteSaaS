# OmniAgent

OmniAgent es una plataforma modular de agentes IA para crear, validar, construir y lanzar micro-SaaS, automatizaciones, productos digitales y negocios verticales.

Este MVP implementa primero **SaaS Builder**. El usuario ingresa una idea y recibe validacion del nicho, propuesta de valor, usuarios objetivo, funcionalidades MVP, arquitectura tecnica, backlog, landing page inicial, pricing, plan de lanzamiento de 7 dias y plan para conseguir primeros clientes.

## Estado del MVP

- Next.js App Router, React, Tailwind CSS y shadcn/ui.
- Command Center privado con registro, login, cookie HttpOnly y logout.
- Workspaces: cada usuario tiene un workspace y solo ve sus proyectos.
- Core modular con agentes, prompts versionados, provider adapter y builder.
- Provider local deterministico por defecto para trabajar sin credenciales.
- Adapter OpenAI preparado con `OMNIAGENT_MODEL_PROVIDER=openai`.
- Persistencia por repositorio intercambiable: archivo local o Prisma/Postgres.
- Supabase/Postgres conectado para proyectos, ejecuciones, usuarios, sesiones y workspaces.
- Artefactos editables por proyecto: validacion, backlog, landing, pricing y lanzamiento.

## Arquitectura

```text
src/
  app/
    api/
      auth/
      builders/saas/route.ts
      projects/
    login/page.tsx
    projects/[projectId]/page.tsx
    page.tsx
  components/
    omniagent/
      auth-form.tsx
      project-artifact-editor.tsx
      saas-builder-workbench.tsx
  lib/
    omniagent/
      agents/
      auth/
      builders/
      prompts/
      providers/
      storage/
      artifacts.ts
      types.ts
prisma/schema.prisma
supabase/migrations/
```

La UI no contiene prompts ni logica de agentes. El builder usa `src/lib/omniagent/builders/saas-builder.ts`, los providers viven en `src/lib/omniagent/providers`, y la persistencia se resuelve por `src/lib/omniagent/storage/project-store.ts`.

## Flujo SaaS Builder

1. El usuario se registra o inicia sesion.
2. La app crea/usa su workspace activo.
3. El usuario completa idea, audiencia, mercado y restricciones.
4. `POST /api/builders/saas` valida sesion e input.
5. `runSaaSBuilder` ejecuta el provider seleccionado.
6. El proyecto se guarda con `workspaceId`.
7. El Command Center muestra solo historial del workspace activo.
8. El detalle `/projects/[projectId]` permite editar artefactos guardados.

## Variables de entorno

Crea `.env.local` desde `.env.example`.

```bash
OMNIAGENT_MODEL_PROVIDER=local
OMNIAGENT_STORAGE_DRIVER=prisma
OPENAI_MODEL=gpt-5.4-mini
OPENAI_API_KEY=
DATABASE_URL=postgresql://...
```

Para desarrollo sin base externa puedes usar:

```bash
OMNIAGENT_STORAGE_DRIVER=file
```

Para usar OpenAI:

```bash
OMNIAGENT_MODEL_PROVIDER=openai
OPENAI_API_KEY=...
```

No uses secretos en variables `NEXT_PUBLIC_*`.

## Base de datos

Prisma usa `prisma/schema.prisma` y genera cliente en `src/generated/prisma`, que no se versiona.

Migracion Supabase versionada:

```text
supabase/migrations/20260702210000_private_workspace_auth.sql
```

Proyecto Supabase actual:

- Ref: `fxnrgzxmhorwpdysclue`
- URL: `https://fxnrgzxmhorwpdysclue.supabase.co`
- GitHub: `https://github.com/leomacaris1/OmniAgenteSaaS`

## Correr localmente

```bash
npm install
npm run prisma:generate
npm run dev
```

Abrir `http://localhost:3000`, crear una cuenta y ejecutar SaaS Builder.

Verificaciones:

```bash
npm test
npm run lint
npm run build
```

## Roadmap sano para ingresos

1. Cerrar private MVP: auth, workspaces, persistencia y flujo SaaS Builder confiable.
2. Mejorar calidad de output: plantillas por vertical, scoring configurable y comparador de ideas.
3. Exportar activos: landing, backlog, roadmap, pricing y plan comercial en formatos reutilizables.
4. Preparar pilotos pagos: onboarding, cuentas, limites, feedback y soporte manual.
5. Medir conversion: ideas creadas, proyectos abiertos, artefactos editados y usuarios activos.
6. Agregar billing cuando haya valor validado con pilotos, no antes.
7. Expandir builders: Automation Builder, Content Builder y Agent Builder.

## Proxima prioridad

El siguiente hito recomendado es **pilotos privados**: onboarding simple, limite de uso por workspace, captura de feedback y export de artefactos. Eso acerca el producto a ingresos sin inflar arquitectura prematuramente.
