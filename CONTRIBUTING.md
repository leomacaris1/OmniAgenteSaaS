# Contribuir a OmniAgenteSaaS

## Flujo de ramas

- `main` es la rama por defecto y debe mantenerse siempre desplegable.
- Todo cambio se desarrolla en una rama corta y se integra a `main` vía Pull Request — nunca push directo a `main`.
- Convención de nombres:
  - `feature/<descripcion-corta>` para trabajo humano.
  - `claude/<descripcion-corta>` para sesiones de agentes.
- Ramas de vida corta: mergeadas o cerradas apenas se integra el cambio, para no acumular deriva respecto a `main`.

## Antes de abrir un PR

Correr localmente (o dejar que CI lo confirme):

```bash
npm run lint
npm test
npm run build
```

## CI

`.github/workflows/ci.yml` corre en cada push a `main`/`feature/**`/`claude/**` y en cada PR contra `main`: instala dependencias, genera el cliente de Prisma, lintea, testea y construye. Un PR no debería mergearse con CI en rojo.

**Nota operativa:** `main` debería tener activada la regla de protección de rama en GitHub (exigir que el check de CI pase antes de mergear). Esa regla se configura en GitHub (Settings → Branches), no en un archivo del repo — si todavía no está activada, es la única acción pendiente para que esta convención se haga cumplir automáticamente.

## Variables de entorno y verificaciones

Ver la sección "Variables de entorno" y "Correr localmente" en `README.md`.
