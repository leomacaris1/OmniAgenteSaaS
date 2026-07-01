# OmniAgent

OmniAgent es una plataforma modular de agentes IA para crear, validar, construir y lanzar micro-SaaS, automatizaciones, productos digitales y negocios verticales.

Este primer MVP implementa el módulo **SaaS Builder**: el usuario ingresa una idea y recibe validación del nicho, propuesta de valor, usuarios objetivo, funcionalidades MVP, arquitectura técnica, backlog, landing page inicial, pricing, plan de lanzamiento de 7 días y plan para conseguir primeros clientes.

## Estado del MVP

- Next.js App Router, React, Tailwind CSS y shadcn/ui.
- Core modular con agentes, prompts versionados, provider adapter y builder.
- Provider local determinístico por defecto para trabajar sin credenciales.
- Adapter OpenAI preparado y configurable con `OMNIAGENT_MODEL_PROVIDER=openai`.
- Persistencia local en `data/omniagent.json` para proyectos y ejecuciones.
- Esquema Prisma inicial para migrar a PostgreSQL/Supabase.
- Dashboard y Command Center funcionales en la pantalla principal.

## Arquitectura

```text
src/
├── app/
│   ├── api/
│   │   ├── builders/saas/route.ts
│   │   └── projects/route.ts
│   └── page.tsx
├── components/
│   └── omniagent/saas-builder-workbench.tsx
└── lib/
    └── omniagent/
        ├── agents/registry.ts
        ├── builders/saas-builder.ts
        ├── prompts/saas-builder.v1.ts
        ├── providers/
        │   ├── index.ts
        │   ├── local-provider.ts
        │   ├── openai-provider.ts
        │   └── types.ts
        ├── storage/project-store.ts
        └── types.ts
```

`prisma.config.ts` contiene la URL de base de datos para Prisma 7. El cliente generado se escribe en `src/generated/prisma` y queda fuera de git.

## Flujo SaaS Builder

1. El usuario completa idea, audiencia, mercado y restricciones.
2. `POST /api/builders/saas` valida el input.
3. `runSaaSBuilder` selecciona provider y ejecuta el flujo.
4. El provider genera el plan estructurado.
5. El proyecto y la ejecución quedan guardados.
6. El Command Center muestra resultado e historial.

## Variables de entorno

Copia `.env.example` a `.env.local`.

```bash
OMNIAGENT_MODEL_PROVIDER=local
OPENAI_MODEL=gpt-5.4-mini
OPENAI_API_KEY=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/omniagent
```

Para usar OpenAI:

```bash
OMNIAGENT_MODEL_PROVIDER=openai
OPENAI_API_KEY=...
```

El modelo default recomendado para el adapter es `gpt-5.4-mini`, pero puede cambiarse con `OPENAI_MODEL`.

## Correr localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

Verificaciones:

```bash
npm run lint
npm run build
```

## Base de datos

El MVP usa archivo local para acelerar el desarrollo. Para pasar a Supabase/PostgreSQL:

```bash
cp .env.example .env.local
npm run prisma:generate
npm run prisma:push
```

Luego reemplazar `src/lib/omniagent/storage/project-store.ts` por un repositorio Prisma manteniendo la misma interfaz (`saveProject`, `listProjects`, `listRuns`).

## Plan técnico de 7 días

1. Día 1: cerrar SaaS Builder con outputs consistentes y persistencia local.
2. Día 2: conectar OpenAI real, streaming y manejo robusto de errores.
3. Día 3: migrar persistencia a Supabase/PostgreSQL con Prisma.
4. Día 4: agregar exportación de landing/backlog y edición de artefactos.
5. Día 5: implementar scoring configurable y comparación de ideas.
6. Día 6: crear plantillas verticales y primer builder adicional.
7. Día 7: preparar onboarding, demo, pricing real y pilotos con primeros usuarios.

## Próximas decisiones de producto

- Elegir vertical inicial: micro-SaaS genérico vs. operador para negocios B2B.
- Definir si el output se vende como software self-serve, servicio asistido o ambos.
- Agregar cuentas/usuarios antes de compartir demos públicas.
- Convertir el historial local en workspace multiusuario.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
