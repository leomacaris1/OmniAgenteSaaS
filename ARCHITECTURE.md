# Arquitectura de OmniAgenteSaaS

> Documento generado a partir de una revisión completa del código en `claude/project-architecture-review-filx1s`. Describe el estado real del MVP, no un plan aspiracional.

## 1. Qué es el proyecto

OmniAgent es una plataforma para convertir una idea de negocio en un plan de micro-SaaS: validación de nicho, propuesta de valor, arquitectura técnica, backlog, landing page, pricing, plan de lanzamiento de 7 días y plan de primeros clientes. El MVP actual implementa un único builder: **SaaS Builder**.

Es una app Next.js full-stack (frontend + API routes) sin backend separado. Toda la lógica de dominio vive en `src/lib/omniagent/`.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.9 (App Router), React 19.2.4 |
| Lenguaje | TypeScript 5, `strict: true` |
| UI | Tailwind CSS 4, shadcn/ui (estilo `radix-nova`), Radix UI, lucide-react |
| Validación | Zod 4 |
| IA | OpenAI SDK 6 (`responses.create` con `json_schema` estricto) |
| ORM / DB | Prisma 7 + `@prisma/adapter-pg` sobre PostgreSQL (pensado para Supabase) |
| Testing | Vitest 4 (`src/**/*.test.ts`) |
| Lint | ESLint 9 (`eslint-config-next`) |

No hay Docker, CI (`.github/workflows`) ni configuración de despliegue más allá de lo estándar de Next.js/Vercel. `AGENTS.md` advierte que esta versión de Next.js puede tener comportamientos distintos a los conocidos y remite a `node_modules/next/dist/docs/`.

## 3. Estructura de directorios

```text
src/
├── app/
│   ├── page.tsx                                          # Command Center (Home)
│   ├── layout.tsx
│   ├── globals.css
│   ├── projects/[projectId]/page.tsx                     # Detalle + edición de artefactos
│   └── api/
│       ├── builders/saas/route.ts                         # POST: ejecuta el builder
│       ├── projects/route.ts                               # GET: lista proyectos + runs
│       └── projects/[projectId]/
│           ├── route.ts                                    # GET: proyecto + artefactos
│           └── artifacts/[artifactKey]/route.ts             # PATCH: edita un artefacto
├── components/
│   ├── omniagent/
│   │   ├── saas-builder-workbench.tsx                      # Formulario + resultado + historial
│   │   └── project-artifact-editor.tsx                     # Editor JSON por artefacto
│   └── ui/                                                  # Primitivas shadcn (button, card, tabs...)
└── lib/
    ├── utils.ts
    └── omniagent/
        ├── types.ts                                         # Contrato central: SaaSBuilderOutput, etc.
        ├── artifacts.ts                                      # Extrae/actualiza artefactos editables
        ├── agents/registry.ts                                # Catálogo de 10 roles de agente (metadata)
        ├── builders/saas-builder.ts                          # Orquesta provider + persistencia
        ├── prompts/saas-builder.v1.ts                        # System prompt versionado
        ├── providers/
        │   ├── index.ts                                      # Selector local/openai por env var
        │   ├── local-provider.ts                             # Generador determinístico sin IA
        │   ├── openai-provider.ts                             # Adapter real con schema estricto
        │   └── types.ts
        └── storage/
            ├── types.ts                                      # Interfaz ProjectRepository
            ├── project-store.ts                              # Selector file/prisma por env var
            ├── file-project-repository.ts                     # Persistencia en data/omniagent.json
            └── prisma-project-repository.ts                   # Persistencia en Postgres/Supabase

prisma/schema.prisma                                          # Modelo de datos relacional
prisma.config.ts                                               # Config de Prisma 7 (fuera del schema)
```

## 4. Flujo de datos (caso de uso principal)

```
Usuario (SaaSBuilderWorkbench)
   │  submit { idea, audience, region, constraints }
   ▼
POST /api/builders/saas  ──▶  zod valida input
   ▼
runSaaSBuilder(input)
   ├─▶ getModelProvider()          → local | openai (env OMNIAGENT_MODEL_PROVIDER)
   ├─▶ provider.generateSaaSPlan() → genera SaaSBuilderOutput (sin id/createdAt/provider)
   ├─▶ completa id, createdAt, provider, promptVersion, input
   └─▶ saveProject(project, run)
          └─▶ getProjectRepository() → file | prisma (env OMNIAGENT_STORAGE_DRIVER)
                 ├─ file:   escribe data/omniagent.json (persiste hasta 50 proyectos / 100 runs)
                 └─ prisma: Project + AgentRun (+ GeneratedArtifact) en Postgres
   ▼
Respuesta JSON → UI renderiza tabs: Validación / Producto / Arquitectura / Go-to-market / Landing
```

Edición de artefactos: `GET /api/projects/[id]` trae `project` + `getEditableArtifacts(project)`; `PATCH /api/projects/[id]/artifacts/[key]` llama `updateProjectArtifact`, que reescribe el campo correspondiente del proyecto (`updateEditableArtifact` en `artifacts.ts`) y persiste de nuevo vía el mismo repositorio.

## 5. Abstracciones clave (los dos "puntos de extensión" del sistema)

### 5.1 `ModelProvider` (IA)
Interfaz única: `generateSaaSPlan(params) → Promise<SaaSBuilderOutput sin metadata>`.
- **`local-provider.ts`**: determinístico, basado en heurísticas de texto (detecta vertical por palabras clave: restaurante, inmobiliaria, salud, finanzas, educación). Permite usar la app sin credenciales.
- **`openai-provider.ts`**: usa `openai.responses.create` con `text.format.json_schema` (`strict: true`) generado desde el mismo `zod` schema que valida la respuesta al parsear. Modelo default `gpt-5.4-mini` (override con `OPENAI_MODEL`).
- El selector (`providers/index.ts`) usa `import()` dinámico para el adapter de OpenAI, evitando cargar el SDK si no se usa.

### 5.2 `ProjectRepository` (persistencia)
Interfaz única: `saveProject / listProjects / getProject / updateProjectArtifact / listRuns`.
- **`file-project-repository.ts`**: JSON plano en `data/omniagent.json` (gitignored), sin locking — no apto para escrituras concurrentes, pero suficiente para desarrollo/demo.
- **`prisma-project-repository.ts`**: Postgres vía Prisma 7 con adapter `pg`. Guarda el `SaaSBuilderOutput` completo como `Json` en `Project.output` (fuente de verdad) y además desnormaliza cada artefacto editable en `GeneratedArtifact` (para futura consulta granular). Import dinámico del cliente generado (`src/generated/prisma`, fuera de git).
- El selector (`storage/project-store.ts`) también usa `import()` dinámico para no requerir `DATABASE_URL` si se usa el driver `file`.

Ambos selectores leen `process.env` en cada llamada (no cachean la elección), lo cual es intencional para tests pero significa que cambiar la env var en runtime cambia el comportamiento sin reiniciar el proceso.

## 6. Modelo de dominio (Prisma)

```
Project 1───* AgentRun
Project 1───* GeneratedArtifact
```

- **Project**: idea + inputs del usuario, `provider`, `promptVersion`, y el `output` completo como JSON (denormalizado).
- **AgentRun**: registro de ejecución — builder, provider, lista de agentes involucrados, status.
- **GeneratedArtifact**: copia desnormalizada de cada artefacto editable (`validation`, `backlog`, `landing`, `pricing`, `launch`, `customers`) para permitir edición/consulta independiente del blob `output`.
- **PromptVersion**: modelo definido en el schema pero **no usado en ningún lado del código actual** — el versionado de prompt real vive hardcodeado en `prompts/saas-builder.v1.ts` (`SAAS_BUILDER_PROMPT_VERSION = "saas-builder.v1"`). Es deuda/planeamiento para un futuro sistema de prompts versionados en DB.

No hay modelo de `User`, `Organization`, `Account` ni nada de autenticación/multi-tenancy en el schema.

## 7. "Sistema de agentes": qué es realmente

`agents/registry.ts` define 10 roles (`ceo`, `research`, `business-analyst`, `developer`, `design`, `marketing`, `copywriter`, `sales`, `automation`, `qa`) con nombre y responsabilidad — **son metadata descriptiva, no orquestación real**. No hay 10 llamadas a LLM ni un grafo de agentes: hay **una sola llamada** al provider (local u OpenAI) que devuelve un plan que ya trae asignado un `owner`/`agent` por feature/tarea del backlog. El "core de agentes" en la UI es una función de presentación (`activeAgents = registry.filter(role !== "automation")`), no un pipeline de ejecución.
`SAAS_BUILDER_AGENT_SEQUENCE` (9 roles, sin `automation`) se persiste en `AgentRun.agents` como trazabilidad de qué roles "participaron" conceptualmente en ese run.

## 8. API routes

| Ruta | Método | Función |
|---|---|---|
| `/api/builders/saas` | POST | Valida input (zod), ejecuta `runSaaSBuilder`, devuelve el proyecto completo |
| `/api/projects` | GET | Lista proyectos (máx. 50) + runs (máx. 100) |
| `/api/projects/[projectId]` | GET | Proyecto + artefactos editables; 404 si no existe |
| `/api/projects/[projectId]/artifacts/[artifactKey]` | PATCH | Actualiza un artefacto; valida `artifactKey` contra el enum |

Todas usan `NextResponse.json`, manejo de errores con try/catch y status codes explícitos (400/404). No hay autenticación, autorización, rate limiting ni CORS configurado — cualquiera con acceso a la app puede leer/escribir cualquier proyecto.

## 9. Frontend

- **`SaaSBuilderWorkbench`** (`"use client"`, en `/`): formulario controlado (idea/audience/region/constraints con defaults en español), fetch al montar para traer historial, POST al submit, muestra resultado en curso vía `ProjectResult` (tabs: Validación, Producto, Arquitectura, Go-to-market, Landing) y una lista de historial con link a `/projects/[id]`.
- **`/projects/[projectId]`**: Server Component (`async function`), trae el proyecto server-side con `getProject` + `getEditableArtifacts`, renderiza contexto (idea original, usuarios objetivo) y delega la edición a `ProjectArtifactEditor` (client component, no leído en detalle pero referenciado por `artifacts.ts`).
- UI: shadcn/ui estilo `radix-nova`, Tailwind 4, iconos `lucide-react`. Todo en español para el usuario final.

## 10. Variables de entorno (`.env.example`)

```bash
OMNIAGENT_MODEL_PROVIDER=local      # local | openai
OMNIAGENT_STORAGE_DRIVER=file       # file | prisma
OPENAI_MODEL=gpt-5.4-mini
OPENAI_API_KEY=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/omniagent
```

Notas del propio README: no exponer `service_role` de Supabase ni secretos en variables `NEXT_PUBLIC_*`; el proyecto Supabase dedicado es `fxnrgzxmhorwpdysclue`; si se usa Supabase CLI, las migraciones deben crearse con `supabase migration new <name>`, no a mano.

## 11. Testing y calidad

- Vitest cubre por ahora solo `src/lib/omniagent/artifacts.test.ts` (lógica pura de extracción/actualización de artefactos). No hay tests de API routes, providers, ni de los repositorios de storage.
- `predev`/`prebuild`/`prelint`/`pretest` corren `prisma generate` automáticamente — el proyecto asume que el cliente Prisma siempre está actualizado antes de cualquier comando.
- No hay CI configurado (sin `.github/workflows`).

## 12. Diagnóstico arquitectónico

**Fortalezas:**
- Separación limpia por capas: dominio (`types.ts`) → orquestación (`builders/`) → provider/storage intercambiables por interfaz. Cambiar de `local`→`openai` o `file`→`prisma` no toca rutas ni UI, tal como documenta el README.
- Contrato de salida (`SaaSBuilderOutput`) compartido entre provider local, provider OpenAI (vía zod schema) y UI — reduce drift entre mock y producción.
- Imports dinámicos evitan cargar `openai` o el cliente Prisma cuando no se usan, manteniendo el arranque liviano en modo `local`/`file`.

**Gaps y riesgos (a decidir como próximos pasos de producto, consistente con lo que el propio README lista en "Próximas decisiones"):**
1. **Sin autenticación ni multi-tenancy**: todas las API routes son públicas y comparten un único store; no hay `userId`/`orgId` en ningún modelo. Bloqueante antes de compartir demos públicas (ya señalado en el README).
2. **`file-project-repository` sin locking**: escrituras concurrentes pueden pisarse (read-modify-write sobre un único JSON). Aceptable solo en desarrollo mono-usuario.
3. **`PromptVersion` en el schema pero no usado**: hoy el versionado de prompts es un string hardcodeado; si se quiere versionado real en DB (A/B de prompts, rollback), falta la integración.
4. **Sin streaming ni manejo robusto de errores del proveedor OpenAI**: `openai-provider.ts` asume `response.output_text` siempre parseable; un fallo de la API o una respuesta que no cumpla el schema estricto rompe la request sin retry ni fallback a `local`.
5. **Sin rate limiting/CORS/validación de tamaño de input** más allá del mínimo de 10 caracteres en `idea`.
6. **Sin CI**: nada corre `lint`/`test`/`build` automáticamente en push/PR.
7. **`GeneratedArtifact` desnormalizado sin verdadera necesidad actual**: hoy no hay ninguna query que lea de esa tabla en vez de `Project.output`; es preparación a futuro, pero introduce doble escritura que hay que mantener sincronizada manualmente (visible en `writeArtifacts` y en `updateProjectArtifact` del repo Prisma).

Esto es documentación descriptiva del estado actual — no se modificó ningún archivo del código fuente. El documento vive en `ARCHITECTURE.md` en la raíz del repo.
