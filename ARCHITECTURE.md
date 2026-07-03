# Arquitectura de OmniAgenteSaaS

> Documento vivo que describe el estado real del sistema, no un plan aspiracional. Última revisión: post "private workspace auth" + "pilot feedback and exports" (Fase 1 del roadmap completa, parte de la Fase 3 adelantada).

## 1. Qué es el proyecto

OmniAgent es una plataforma para convertir una idea de negocio en un plan de micro-SaaS: validación de nicho, propuesta de valor, arquitectura técnica, backlog, landing page, pricing, plan de lanzamiento de 7 días y plan de primeros clientes. El MVP actual implementa un único builder: **SaaS Builder**, ahora detrás de un login privado con workspaces por usuario.

Es una app Next.js full-stack (frontend + API routes) sin backend separado. Toda la lógica de dominio vive en `src/lib/omniagent/`.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.9 (App Router), React 19.2.4 |
| Lenguaje | TypeScript 5, `strict: true` |
| UI | Tailwind CSS 4, shadcn/ui (estilo `radix-nova`), Radix UI, lucide-react |
| Validación | Zod 4 |
| IA | OpenAI SDK 6 (`responses.create` con `json_schema` estricto) |
| ORM / DB | Prisma 7 + `@prisma/adapter-pg` sobre PostgreSQL (Supabase como host) |
| Auth | Propia: email+contraseña (scrypt), sesiones con token hasheado en DB, cookie `httpOnly` |
| Testing | Vitest 4 (`src/**/*.test.ts`) |
| Lint / CI | ESLint 9 (`eslint-config-next`), GitHub Actions (`.github/workflows/ci.yml`) |

Node anclado en `.nvmrc` (22) y `engines` (`>=20`). `AGENTS.md` advierte que esta versión de Next.js puede diferir de lo conocido y remite a `node_modules/next/dist/docs/`.

## 3. Estructura de directorios

```text
src/
├── app/
│   ├── page.tsx                                          # Landing pública (sin sesión) / Command Center (logueado)
│   ├── login/page.tsx                                     # Registro / login
│   ├── projects/[projectId]/page.tsx                      # Detalle + edición de artefactos
│   └── api/
│       ├── auth/{register,login,logout,me}/route.ts        # Auth propia con cookie de sesión
│       ├── builders/saas/route.ts                          # POST: ejecuta el builder (con límite por workspace)
│       ├── feedback/route.ts                                # POST: feedback de pilotos
│       └── projects/
│           ├── route.ts                                     # GET: proyectos + runs del workspace
│           └── [projectId]/
│               ├── route.ts                                 # GET: proyecto + artefactos (scoped)
│               ├── export/route.ts                           # GET: export Markdown/JSON
│               ├── regenerate/route.ts                        # POST: regenera una sección con IA
│               └── artifacts/[artifactKey]/route.ts          # PATCH: edita un artefacto (scoped)
├── components/
│   ├── omniagent/  (public-landing, auth-form, saas-builder-workbench, project-artifact-editor)
│   └── ui/          # Primitivas shadcn
└── lib/omniagent/
    ├── types.ts                    # Contrato central (SaaSBuilderOutput incluye workspaceId?)
    ├── artifacts.ts                 # Artefactos editables (6 claves)
    ├── agents/registry.ts           # Catálogo de 10 roles (metadata, no orquestación)
    ├── builders/saas-builder.ts     # Orquesta provider (con fallback) + persistencia
    ├── prompts/                      # saas-builder.v1 (histórico) y v2 (activo, con rúbrica de score)
    ├── providers/
    │   ├── local-provider.ts          # Determinístico, sin credenciales; también regenera secciones
    │   ├── openai-provider.ts          # responses API + json_schema estricto, con retry
    │   ├── plan-schema.ts               # Zod del plan y de cada sección + sanitizado del wire schema
    │   ├── fallback.ts                   # openai→local con telemetría (fallbackFrom, error, costo)
    │   ├── retry.ts                       # Reintentos con backoff según status HTTP
    │   └── openai-cost.ts                  # Costo aproximado por tokens (precios via env)
    ├── auth/
    │   ├── password.ts               # scrypt + timingSafeEqual
    │   ├── session.ts                 # Cookie httpOnly, token hasheado (sha256) en UserSession, 7 días
    │   ├── rate-limit.ts               # Sliding window in-memory (login: 5 intentos / 15 min)
    │   └── repository.ts              # registerUser (crea workspace propio), authenticateUser
    ├── exports/project-export.ts     # Markdown del proyecto + copy de landing/backlog
    ├── feedback/repository.ts        # PilotFeedback (valida pertenencia al workspace)
    ├── workspaces/limits.ts          # Límite de proyectos por plan (founding-pilot: 20; env pisa en dev)
    └── storage/
        ├── types.ts                   # ProjectRepository + ProjectScope { workspaceId? }
        ├── prisma-client.ts            # Cliente Prisma compartido (lazy, adapter pg)
        ├── project-store.ts            # Selector file/prisma por env var
        ├── file-project-repository.ts   # JSON local con filtro por workspace
        └── prisma-project-repository.ts # Postgres, queries scoped por workspaceId

prisma/schema.prisma                 # Modelo completo (ver §6)
supabase/migrations/*.sql             # 4 migraciones SQL versionadas
```

## 4. Autenticación y tenancy (estado actual)

- **Registro** (`registerUser`): crea `AppUser` (email normalizado, `passwordHash` con scrypt + salt), un `Workspace` propio ("<handle> Workspace") y la membresía `owner`, todo en una transacción.
- **Sesión**: token aleatorio de 32 bytes; en DB se guarda solo su hash sha256 (`UserSession.tokenHash`) con expiración a 7 días; al cliente viaja en cookie `omniagent_session` (`httpOnly`, `sameSite: lax`, `secure` en producción).
- **Protección**: las rutas de API y las páginas resuelven `getCurrentSession()`; sin sesión → 401 (API) o redirección a login. Todas las lecturas/escrituras de proyectos pasan un `ProjectScope { workspaceId }`, así cada usuario ve solo los proyectos de su workspace — tanto en el driver `prisma` (cláusulas `where`) como en el `file` (filtro en memoria).
- **Límites por plan**: cada `Workspace` tiene un `plan` (default `founding-pilot` → 20 proyectos, mapa en `workspaces/limits.ts`). Se verifica en `POST /api/builders/saas` antes de generar; al alcanzarlo devuelve 403 con el uso actual. `OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT` (env) pisa cualquier plan, pensado solo para desarrollo.

**Decisión registrada**: originalmente se había diseñado tenancy con `User`/`Organization` preparado para **Supabase Auth**. En paralelo se implementó esta auth propia con `AppUser`/`Workspace`, que quedó adoptada como base por ser funcional y cubrir el objetivo del MVP privado. Si más adelante se quiere migrar a Supabase Auth (OAuth, magic links, no gestionar contraseñas propias), el camino es mapear `AppUser` → `auth.users` y reemplazar `session.ts`; la separación en `auth/` lo mantiene localizado.

## 5. Flujo de datos (caso de uso principal)

```
Login/registro → cookie de sesión
   ▼
POST /api/builders/saas  ── getCurrentSession() → 401 si no hay sesión
   ├─ zod valida input
   ├─ countProjects(scope) vs. límite del workspace → 403 si se alcanzó
   ▼
runSaaSBuilder(input, { workspaceId })
   ├─▶ getModelProvider()          → local | openai (env OMNIAGENT_MODEL_PROVIDER)
   ├─▶ generatePlanWithFallback()  → openai (con retry) y, si falla, local;
   │      la telemetría del run registra fallbackFrom, error, tokens y costo
   ├─▶ completa id, workspaceId, createdAt, provider (el que realmente corrió),
   │      promptVersion (saas-builder.v2), input
   └─▶ saveProject(project, run + telemetría, { workspaceId })
          └─▶ file | prisma (env OMNIAGENT_STORAGE_DRIVER)
   ▼
UI: tabs de resultado + historial del workspace + export Markdown/JSON + feedback
```

Regeneración por sección: `POST /api/projects/[id]/regenerate` recibe `artifactKey`
y una `idea` opcional (editada en el detalle del proyecto); regenera solo esa
sección con el mismo esquema de fallback, persiste el proyecto completo
(`replaceProject`, incluyendo la idea nueva) y registra un `AgentRun` adicional
con la telemetría de esa regeneración.

## 6. Modelo de dominio (Prisma)

```
Workspace 1───* WorkspaceMember *───1 AppUser
Workspace 1───* Project 1───* AgentRun
                Project 1───* GeneratedArtifact
AppUser  1───* UserSession
Workspace/AppUser/Project ───* PilotFeedback
```

- **AppUser**: email único, `passwordHash`; **Workspace**: 1 por usuario al registrarse, con `plan` comercial (default `"founding-pilot"`); **WorkspaceMember**: rol como string (default `"owner"`), único por `(userId, workspaceId)`.
- **Project.workspaceId**: nullable, `onDelete: Cascade`, indexado. El output completo sigue viviendo en `Project.output: Json` como fuente de verdad.
- **UserSession**: token hasheado, `expiresAt` indexado.
- **PilotFeedback**: rating opcional 1–5 + mensaje, ligado a workspace/usuario y opcionalmente a un proyecto (validando pertenencia).
- **AgentRun** ahora incluye telemetría: `fallbackFrom`, `errorMessage`, `inputTokens`, `outputTokens`, `costUsd` (aproximado, no fuente de facturación).
- **PromptVersion**: sigue definido y sin usar (el versionado real es el string en `prompts/saas-builder.v2.ts`, activo; `v1` queda como histórico).
- Migraciones: SQL versionado en `supabase/migrations/` (convención del README: `supabase migration new <name>`), además de `prisma db push` para desarrollo.

## 7. API routes

| Ruta | Método | Auth | Función |
|---|---|---|---|
| `/api/auth/register` | POST | — | Alta de usuario + workspace + sesión |
| `/api/auth/login` | POST | — | Login + sesión (rate limit: 5 intentos / 15 min por email+IP) |
| `/api/auth/logout` | POST | cookie | Cierra sesión |
| `/api/auth/me` | GET | cookie | Usuario + workspace actual |
| `/api/builders/saas` | POST | cookie | Genera proyecto (respeta límite del workspace) |
| `/api/projects` | GET | cookie | Proyectos + runs del workspace |
| `/api/projects/[id]` | GET | cookie | Proyecto + artefactos (404 si no es del workspace) |
| `/api/projects/[id]/export` | GET | cookie | Export `?format=markdown\|json` |
| `/api/projects/[id]/regenerate` | POST | cookie | Regenera una sección con IA (idea editable, con fallback) |
| `/api/projects/[id]/artifacts/[key]` | PATCH | cookie | Edita un artefacto (scoped) |
| `/api/feedback` | POST | cookie | Feedback de piloto (rating + mensaje) |

## 8. "Sistema de agentes": qué es realmente

`agents/registry.ts` define 10 roles con nombre y responsabilidad — **metadata descriptiva, no orquestación**. Hay **una sola llamada** al provider por ejecución; el plan devuelto ya asigna `owner`/`agent` por feature/tarea. `SAAS_BUILDER_AGENT_SEQUENCE` se persiste en `AgentRun.agents` como trazabilidad conceptual.

## 9. Variables de entorno

```bash
OMNIAGENT_MODEL_PROVIDER=local            # local | openai
OMNIAGENT_STORAGE_DRIVER=file             # file | prisma
OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT=      # opcional, pisa el límite del plan (solo dev)
OPENAI_MODEL=gpt-5.4-mini
OPENAI_API_KEY=
OPENAI_PRICE_INPUT_PER_1M=0.25            # para estimar costo por run (informativo)
OPENAI_PRICE_OUTPUT_PER_1M=2
DATABASE_URL=postgresql://...
```

Supabase actual: ref `fxnrgzxmhorwpdysclue`. No exponer secretos en `NEXT_PUBLIC_*`.

## 10. Testing y CI

- Vitest: `artifacts`, `auth/password`, `auth/rate-limit`, `exports/project-export`, `workspaces/limits`, `providers/fallback`, `providers/openai-cost`, `providers/plan-schema`. Sin tests de rutas de API ni repositorios.
- CI (`.github/workflows/ci.yml`): `npm ci` → `prisma generate` → lint → test → build, en push (`main`, `feature/**`, `claude/**`) y PR a `main`. No necesita secretos: `prisma generate` no se conecta y el build usa drivers default.
- Convención de ramas y PRs en `CONTRIBUTING.md`. **Pendiente**: activar branch protection en `main` (Settings → Branches) para que el CI verde sea obligatorio.

## 11. Diagnóstico arquitectónico

**Fortalezas:**
- Separación por capas intacta: dominio → builder → provider/storage intercambiables por interfaz; la auth quedó igualmente encapsulada (`auth/`) y las rutas solo consumen `getCurrentSession()`.
- Scoping por workspace aplicado de punta a punta (rutas → `ProjectScope` → ambos drivers), no solo en la UI.
- Criptografía de auth razonable para MVP privado: scrypt con salt, comparación en tiempo constante, tokens de sesión nunca en claro en DB.

**Gaps y riesgos a vigilar:**
1. **`Project.workspaceId` nullable + `onDelete: Cascade`**: proyectos huérfanos son posibles, y borrar un workspace borra silenciosamente todos sus proyectos (el output generado es la única copia del trabajo). Considerar requerido + `Restrict` cuando haya flujo de borrado real.
2. **`WorkspaceMember.role` como string** (no enum): sin validación a nivel de DB; hoy solo existe `"owner"`.
3. **Auth propia = responsabilidad propia**: reset de contraseña, verificación de email y rotación de sesiones no existen todavía. El login ya tiene rate limiting (5 intentos / 15 min por email+IP), pero es **in-memory**: con más de una instancia cada proceso cuenta por separado — mover a un store compartido antes de escalar horizontalmente.
4. **`SaaSBuilderOutput.workspaceId`**: metadata de tenancy dentro del tipo de dominio que también modela la salida del LLM (el zod schema del provider OpenAI no lo incluye, así que no se pide al modelo, pero el tipo quedó mezclado).
5. **`PromptVersion` sigue sin usarse** — conectarlo o eliminarlo.
6. **Costo por run es una estimación**: se calcula con precios configurados por env (`OPENAI_PRICE_*`), no con datos de facturación reales; revisar los defaults cuando cambie el modelo o su pricing.
7. **`file-project-repository` sin locking**: solo apto para desarrollo mono-proceso.
8. **Regeneración por sección sin control de concurrencia**: dos regeneraciones simultáneas del mismo proyecto pueden pisarse (last-write-wins sobre `Project.output`). Aceptable mono-usuario; revisar si aparece colaboración real.
