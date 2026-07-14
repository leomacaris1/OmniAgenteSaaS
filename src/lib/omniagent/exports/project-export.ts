import type { SaaSBuilderOutput } from "@/lib/omniagent/types";

export function formatProjectMarkdown(project: SaaSBuilderOutput) {
  const lines = [
    `# ${project.landingPage.headline}`,
    "",
    project.landingPage.subheadline,
    "",
    "## Resumen",
    "",
    `- Idea: ${project.input.idea}`,
    `- Audiencia: ${project.input.audience || "No definida"}`,
    `- Mercado: ${project.input.region || "No definido"}`,
    `- Score: ${project.nicheValidation.score}/100`,
    `- Veredicto: ${project.nicheValidation.verdict}`,
    "",
    "## Propuesta de valor",
    "",
    project.valueProposition,
    "",
    "## Validacion del nicho",
    "",
    project.nicheValidation.summary,
    "",
    ...project.nicheValidation.marketSignals.map(
      (signal) => `- **${signal.label}** (${signal.strength}): ${signal.rationale}`,
    ),
    "",
    "## Usuarios objetivo",
    "",
    ...project.targetUsers.map((user) => `- ${user}`),
    "",
    "## Features MVP",
    "",
    ...project.mvpFeatures.map(
      (feature) => `- **${feature.priority}** ${feature.name}: ${feature.outcome} (${feature.owner})`,
    ),
    "",
    "## Arquitectura tecnica",
    "",
    "### Stack",
    ...project.technicalArchitecture.stack.map((item) => `- ${item}`),
    "",
    "### Modulos",
    ...project.technicalArchitecture.modules.map((item) => `- ${item}`),
    "",
    "### Datos",
    ...project.technicalArchitecture.dataModel.map((item) => `- ${item}`),
    "",
    "### Integraciones",
    ...project.technicalArchitecture.integrations.map((item) => `- ${item}`),
    "",
    "## Backlog MVP",
    "",
    ...project.backlog.flatMap((item) => [
      `- **${item.id}** ${item.title} (${item.estimateDays}d, ${item.agent})`,
      ...item.acceptanceCriteria.map((criterion) => `  - ${criterion}`),
    ]),
    "",
    "## Landing page",
    "",
    `- Headline: ${project.landingPage.headline}`,
    `- Subheadline: ${project.landingPage.subheadline}`,
    `- CTA: ${project.landingPage.primaryCta}`,
    ...project.landingPage.sections.map((section) => `- ${section.title}: ${section.body}`),
    "",
    "## Pricing",
    "",
    ...project.pricing.flatMap((plan) => [
      `- **${plan.name}** - ${plan.price}`,
      `  - Target: ${plan.target}`,
      ...plan.includes.map((item) => `  - ${item}`),
    ]),
    "",
    "## Plan de lanzamiento de 7 dias",
    "",
    ...project.launchPlan7Days.map((step) => `- Dia ${step.day}: ${step.goal} - ${step.actions.join("; ")}`),
    "",
    "## Primeros clientes",
    "",
    ...project.firstCustomerPlan.map((step) => `- ${step}`),
    "",
    "## Riesgos",
    "",
    ...project.risks.map((risk) => `- ${risk}`),
  ];

  return `${lines.join("\n").trim()}\n`;
}

/**
 * Landing lista para pegar en un doc de cliente o en un builder de páginas:
 * copy plano, sin metadatos técnicos. Recibe la sección (no el proyecto)
 * para poder usarse desde el editor con el borrador actual.
 */
export function formatLandingCopy(landing: SaaSBuilderOutput["landingPage"]) {
  const lines = [
    landing.headline,
    "",
    landing.subheadline,
    "",
    `[${landing.primaryCta}]`,
    "",
    ...landing.sections.flatMap((section) => [`## ${section.title}`, "", section.body, ""]),
  ];

  return `${lines.join("\n").trim()}\n`;
}

/**
 * Backlog listo para pegar en un gestor de tareas o un doc de alcance.
 */
export function formatBacklogCopy(backlog: SaaSBuilderOutput["backlog"]) {
  const lines = backlog.flatMap((item) => [
    `${item.id} — ${item.title} (${item.estimateDays}d, ${item.agent})`,
    ...item.acceptanceCriteria.map((criterion) => `  - ${criterion}`),
    "",
  ]);

  return `${lines.join("\n").trim()}\n`;
}

export function formatLandingHtml(project: SaaSBuilderOutput) {
  const landing = project.landingPage;
  const sections = landing.sections
    .map(
      (section, index) => `
        <article class="feature">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </article>`,
    )
    .join("");
  const plans = project.pricing
    .map(
      (plan) => `
        <article class="plan">
          <p class="plan-name">${escapeHtml(plan.name)}</p>
          <p class="price">${escapeHtml(plan.price)}</p>
          <p>${escapeHtml(plan.target)}</p>
          <ul>${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(landing.subheadline)}">
  <title>${escapeHtml(landing.headline)}</title>
  <style>
    :root { color-scheme: light; --ink: #17211b; --muted: #536059; --line: #d9dfda; --accent: #087f5b; --warm: #e8593c; --paper: #f7f9f7; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: 0; }
    main { overflow: hidden; }
    .wrap { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
    .hero { min-height: 78vh; display: grid; align-items: center; border-bottom: 1px solid var(--line); background: var(--paper); }
    .eyebrow, .plan-name { color: var(--accent); font-size: .78rem; font-weight: 800; text-transform: uppercase; }
    h1 { max-width: 880px; margin: 18px 0; font-size: clamp(2.6rem, 7vw, 6rem); line-height: .98; font-weight: 800; }
    .lede { max-width: 690px; color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.35rem); line-height: 1.6; }
    .cta { display: inline-block; margin-top: 28px; padding: 14px 20px; border-radius: 6px; background: var(--accent); color: #fff; font-weight: 750; text-decoration: none; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--line); }
    .feature { min-height: 260px; padding: 40px; border-right: 1px solid var(--line); }
    .feature:last-child { border-right: 0; }
    .feature span { color: var(--warm); font-size: .8rem; font-weight: 800; }
    h2 { margin: 42px 0 12px; font-size: 1.4rem; }
    .feature p, .plan p, li { color: var(--muted); line-height: 1.65; }
    .pricing { padding: 80px 0; }
    .pricing h2 { margin: 0 0 32px; font-size: 2rem; }
    .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .plan { padding: 28px; border: 1px solid var(--line); border-radius: 8px; }
    .price { margin: 10px 0; color: var(--ink) !important; font-size: 2rem; font-weight: 800; }
    ul { padding-left: 20px; }
    footer { padding: 28px 0; border-top: 1px solid var(--line); color: var(--muted); font-size: .85rem; }
    @media (max-width: 760px) {
      .hero { min-height: 72vh; }
      .features, .plans { grid-template-columns: 1fr; }
      .feature { min-height: auto; padding: 32px 20px; border-right: 0; border-bottom: 1px solid var(--line); }
      .feature h2 { margin-top: 18px; }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">${escapeHtml(project.valueProposition)}</p>
        <h1>${escapeHtml(landing.headline)}</h1>
        <p class="lede">${escapeHtml(landing.subheadline)}</p>
        <a class="cta" href="mailto:contacto@tu-dominio.com">${escapeHtml(landing.primaryCta)}</a>
      </div>
    </section>
    <section class="features">${sections}</section>
    <section class="pricing">
      <div class="wrap">
        <h2>Planes para empezar</h2>
        <div class="plans">${plans}</div>
      </div>
    </section>
  </main>
  <footer><div class="wrap">${escapeHtml(landing.headline)} - Landing inicial generada con OmniAgent</div></footer>
</body>
</html>
`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}
