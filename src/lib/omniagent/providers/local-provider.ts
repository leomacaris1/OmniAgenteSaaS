import type { ModelProvider } from "@/lib/omniagent/providers/types";

function titleFromIdea(idea: string) {
  const clean = idea.trim().replace(/\s+/g, " ");
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}

function inferVertical(idea: string) {
  const lower = idea.toLowerCase();
  if (lower.includes("restaurante") || lower.includes("restaurant")) return "operaciones gastronómicas";
  if (lower.includes("inmobili") || lower.includes("real estate")) return "servicios inmobiliarios";
  if (lower.includes("salud") || lower.includes("clinic")) return "servicios de salud";
  if (lower.includes("finanza") || lower.includes("invoice")) return "gestión financiera";
  if (lower.includes("educ")) return "educación y formación";
  return "operaciones B2B";
}

export const localProvider: ModelProvider = {
  name: "local",
  async generateSaaSPlan({ input }) {
    const ideaTitle = titleFromIdea(input.idea);
    const vertical = inferVertical(input.idea);
    const audience = input.audience?.trim() || `equipos pequeños de ${vertical}`;
    const region = input.region?.trim() || "mercados hispanohablantes";

    return {
      nicheValidation: {
        verdict: "promising",
        score: 74,
        summary: `${ideaTitle} tiene potencial si se enfoca en un dolor operativo frecuente, medible y con comprador claro. La primera validación debe probar urgencia, presupuesto y repetición del problema antes de ampliar funcionalidades.`,
        marketSignals: [
          {
            label: "Dolor repetitivo",
            strength: "high",
            rationale: `El segmento de ${audience} suele pagar cuando una tarea manual impacta tiempo, ventas o seguimiento.`,
          },
          {
            label: "Diferenciación inicial",
            strength: "medium",
            rationale: "La ventaja debe venir de una implementación vertical y resultados rápidos, no de decir que usa IA.",
          },
          {
            label: "Riesgo de scope creep",
            strength: "medium",
            rationale: "Conviene limitar el MVP a un workflow central con exportación, historial y una métrica de valor.",
          },
        ],
      },
      valueProposition: `Una plataforma que ayuda a ${audience} a convertir ${ideaTitle.toLowerCase()} en un flujo operativo más rápido, medible y vendible en ${region}.`,
      targetUsers: [
        `Dueños o responsables operativos de ${vertical}`,
        "Fundadores no técnicos que necesitan validar una solución vertical",
        "Equipos de ventas o soporte que dependen de seguimiento manual",
      ],
      mvpFeatures: [
        {
          name: "Diagnóstico guiado del caso de uso",
          priority: "P0",
          owner: "research",
          outcome: "Captura problema, comprador, frecuencia, presupuesto y datos disponibles.",
        },
        {
          name: "Generador de plan MVP",
          priority: "P0",
          owner: "developer",
          outcome: "Produce arquitectura, backlog, landing y plan de lanzamiento en una ejecución.",
        },
        {
          name: "Historial de proyectos",
          priority: "P0",
          owner: "automation",
          outcome: "Permite comparar ideas y retomar ejecuciones anteriores.",
        },
        {
          name: "Landing page editable",
          priority: "P1",
          owner: "design",
          outcome: "Convierte el análisis en una página base para captar leads.",
        },
        {
          name: "Score de validación",
          priority: "P1",
          owner: "qa",
          outcome: "Prioriza ideas por claridad de nicho, urgencia y facilidad de distribución.",
        },
      ],
      technicalArchitecture: {
        stack: ["Next.js App Router", "React", "Tailwind CSS", "shadcn/ui", "Prisma", "PostgreSQL/Supabase", "OpenAI API opcional"],
        modules: ["Core orchestrator", "Agent registry", "Provider adapter", "SaaS Builder", "Project store", "Command Center"],
        dataModel: ["Project", "AgentRun", "PromptVersion", "GeneratedArtifact"],
        integrations: ["OpenAI Responses API", "Supabase Postgres", "Vercel", "GitHub"],
      },
      backlog: [
        {
          id: "OA-SB-001",
          title: "Crear endpoint del SaaS Builder",
          agent: "developer",
          estimateDays: 1,
          acceptanceCriteria: ["Valida input", "Ejecuta provider configurado", "Persiste proyecto y run"],
        },
        {
          id: "OA-SB-002",
          title: "Diseñar Command Center",
          agent: "design",
          estimateDays: 1,
          acceptanceCriteria: ["Formulario claro", "Estados de carga/error", "Resultados escaneables"],
        },
        {
          id: "OA-SB-003",
          title: "Versionar prompts",
          agent: "copywriter",
          estimateDays: 1,
          acceptanceCriteria: ["Prompt fuera de UI", "Versión visible en cada run", "Salida JSON documentada"],
        },
        {
          id: "OA-SB-004",
          title: "Agregar persistencia Postgres",
          agent: "automation",
          estimateDays: 2,
          acceptanceCriteria: ["Schema Prisma", "Migración inicial", "Fallback local en desarrollo"],
        },
        {
          id: "OA-SB-005",
          title: "QA comercial del output",
          agent: "qa",
          estimateDays: 1,
          acceptanceCriteria: ["Riesgos explícitos", "Plan de clientes accionable", "Sin consejos genéricos"],
        },
      ],
      landingPage: {
        headline: ideaTitle,
        subheadline: `Convierte un proceso crítico de ${vertical} en una herramienta simple, medible y lista para vender.`,
        primaryCta: "Validar mi caso",
        sections: [
          {
            title: "Problema",
            body: `${audience} pierden tiempo y oportunidades cuando el seguimiento depende de planillas, mensajes sueltos o criterio manual.`,
          },
          {
            title: "Solución",
            body: "Un flujo guiado que captura información, genera recomendaciones y deja un plan listo para ejecutar.",
          },
          {
            title: "Resultado",
            body: "Menos trabajo manual, mejor priorización y una forma clara de medir si la idea merece inversión.",
          },
        ],
      },
      pricing: [
        {
          name: "Validation",
          price: "USD 29/mes",
          target: "Fundadores validando una idea",
          includes: ["10 proyectos", "SaaS Builder", "Landing draft", "Historial básico"],
        },
        {
          name: "Build",
          price: "USD 99/mes",
          target: "Equipos que ejecutan MVPs",
          includes: ["Proyectos ilimitados", "Backlog avanzado", "Exportación", "Providers IA"],
        },
        {
          name: "Operator",
          price: "USD 499/mes",
          target: "Negocios que quieren ejecución asistida",
          includes: ["Workspace privado", "Automatizaciones", "Soporte de implementación", "Playbooks verticales"],
        },
      ],
      launchPlan7Days: [
        { day: 1, goal: "Definir nicho", actions: ["Elegir un vertical", "Escribir 20 hipótesis de dolor", "Preparar entrevista"] },
        { day: 2, goal: "Hablar con mercado", actions: ["Contactar 20 prospectos", "Hacer 5 entrevistas", "Registrar frases exactas"] },
        { day: 3, goal: "Cerrar oferta", actions: ["Elegir un dolor P0", "Definir promesa", "Crear landing"] },
        { day: 4, goal: "Prototipo", actions: ["Construir flujo central", "Agregar captura de leads", "Preparar demo"] },
        { day: 5, goal: "Venta piloto", actions: ["Enviar 30 mensajes", "Hacer 3 demos", "Ofrecer piloto pago"] },
        { day: 6, goal: "Entrega manual asistida", actions: ["Resolver con herramientas simples", "Medir tiempo ahorrado", "Documentar objeciones"] },
        { day: 7, goal: "Decisión", actions: ["Revisar señales", "Ajustar pricing", "Elegir construir, pivotar o descartar"] },
      ],
      firstCustomerPlan: [
        "Crear lista de 50 negocios del nicho con dueño o responsable identificable.",
        "Enviar outreach con un dolor concreto, no con una descripción del producto.",
        "Ofrecer diagnóstico gratuito de 15 minutos y cerrar un piloto pago de bajo riesgo.",
        "Entregar el resultado manualmente antes de automatizar todo.",
      ],
      risks: [
        "Idea demasiado horizontal sin comprador específico.",
        "Output de IA útil pero no conectado a una tarea que alguien pague.",
        "Construir integraciones antes de validar el workflow central.",
      ],
    };
  },
};
