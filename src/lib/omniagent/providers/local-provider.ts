import { getArtifactContent } from "@/lib/omniagent/artifacts";
import type {
  GeneratedSaaSPlan,
  ModelProvider,
  RegenerateSectionParams,
} from "@/lib/omniagent/providers/types";
import type { SaaSBuilderInput } from "@/lib/omniagent/types";

function titleFromIdea(idea: string) {
  const clean = idea.trim().replace(/\s+/g, " ");
  return clean.length > 72 ? `${clean.slice(0, 69)}...` : clean;
}

function isChildNeurodiversityIdea(idea: string) {
  const lower = idea.toLowerCase();
  const mentionsChildren =
    /\b(nino|ninos|nina|ninas|niño|niños|niña|niñas|infantil|children|kids)\b/.test(
      lower,
    );
  const mentionsNeurodiversity =
    /\b(tdah|adhd|neurodiver|atencion|atención|hiperactividad)\b/.test(lower);

  return mentionsChildren && mentionsNeurodiversity;
}

function inferVertical(idea: string) {
  const lower = idea.toLowerCase();
  if (isChildNeurodiversityIdea(idea)) return "educacion infantil y apoyo neurodivergente";
  if (lower.includes("restaurante") || lower.includes("restaurant")) return "operaciones gastronomicas";
  if (lower.includes("inmobili") || lower.includes("real estate")) return "servicios inmobiliarios";
  if (lower.includes("salud") || lower.includes("clinic")) return "servicios de salud";
  if (lower.includes("finanza") || lower.includes("invoice")) return "gestion financiera";
  if (lower.includes("educ")) return "educacion y formacion";
  return "operaciones B2B";
}

function buildSensitiveEducationPlan(input: SaaSBuilderInput): GeneratedSaaSPlan {
  const ideaTitle = titleFromIdea(input.idea);
  const audience =
    input.audience?.trim() || "padres, docentes y profesionales de apoyo educativo";
  const region = input.region?.trim() || "mercados hispanohablantes";

  return {
    nicheValidation: {
      verdict: "needs-focus",
      score: 66,
      summary: `${ideaTitle} tiene demanda potencial en ${region}, especialmente para ${audience} que necesitan actividades educativas breves para ninos con TDAH. El foco debe ser apoyo educativo validado, no diagnostico, tratamiento ni reemplazo terapeutico.`,
      marketSignals: [
        {
          label: "Dolor familiar y escolar frecuente",
          strength: "high",
          rationale:
            "Padres y docentes buscan recursos simples para sostener atencion, rutina y participacion sin depender de improvisacion diaria.",
        },
        {
          label: "Confianza como barrera de compra",
          strength: "high",
          rationale:
            "Al tratarse de ninos con TDAH, la compra exige privacidad, consentimiento adulto, revision profesional y claims muy responsables.",
        },
        {
          label: "Comprador todavia por validar",
          strength: "medium",
          rationale:
            "El pago puede venir de familias, colegios, gabinetes o profesionales; el MVP debe probar que segmento compra primero.",
        },
      ],
    },
    valueProposition:
      "Una plataforma de actividades digitales educativas, cortas e interactivas que ayuda a padres, docentes y profesionales a acompanar a ninos con TDAH con mas estructura, sin sustituir diagnostico ni tratamiento profesional.",
    targetUsers: [
      "Padres y cuidadores que necesitan actividades estructuradas para casa.",
      "Docentes que buscan recursos interactivos para aulas con necesidades de atencion diversas.",
      "Profesionales como psicopedagogos, terapeutas ocupacionales y orientadores que requieren materiales revisados.",
    ],
    mvpFeatures: [
      {
        name: "Biblioteca de microactividades",
        priority: "P0",
        owner: "research",
        outcome:
          "Ofrece actividades educativas de 3 a 10 minutos filtradas por edad, objetivo, energia y contexto de uso.",
      },
      {
        name: "Constructor de sesiones",
        priority: "P0",
        owner: "developer",
        outcome:
          "Permite armar secuencias con pausas, instrucciones breves, recompensa visual y objetivo educativo claro.",
      },
      {
        name: "Modo adulto responsable",
        priority: "P0",
        owner: "design",
        outcome:
          "Entrega instrucciones para padres y docentes con limites de uso, privacidad y lenguaje no clinico.",
      },
      {
        name: "Revision profesional de contenidos",
        priority: "P1",
        owner: "qa",
        outcome:
          "Marca cada contenido como borrador, revisado o aprobado antes de estar disponible en el piloto.",
      },
    ],
    technicalArchitecture: {
      stack: [
        "Next.js App Router",
        "React",
        "Tailwind CSS",
        "shadcn/ui",
        "Supabase Auth",
        "Supabase Postgres",
        "OpenAI API con revision humana",
      ],
      modules: [
        "Biblioteca de actividades educativas",
        "Constructor de sesiones",
        "Roles de adulto responsable y profesional",
        "Workflow de revision profesional",
        "Auditoria de privacidad y consentimiento",
      ],
      dataModel: [
        "User",
        "Workspace",
        "Activity",
        "ActivityReview",
        "SessionPlan",
        "FeedbackNote",
      ],
      integrations: [
        "Supabase Auth y RLS para privacidad infantil",
        "OpenAI para borradores educativos revisables",
        "Vercel para despliegue",
        "Exportacion PDF/Markdown para sesiones",
      ],
    },
    backlog: [
      {
        id: "OA-TDAH-001",
        title: "Modelar biblioteca de actividades revisables",
        agent: "developer",
        estimateDays: 1.5,
        acceptanceCriteria: [
          "Cada actividad guarda edad sugerida, objetivo, duracion, instrucciones y estado de revision.",
          "Solo actividades aprobadas pueden mostrarse en la biblioteca del piloto.",
        ],
      },
      {
        id: "OA-TDAH-002",
        title: "Crear roles de padres, docentes y profesionales",
        agent: "developer",
        estimateDays: 1,
        acceptanceCriteria: [
          "La app distingue permisos de cuidador, docente y profesional.",
          "El MVP no permite cuentas infantiles directas ni datos sensibles innecesarios.",
        ],
      },
      {
        id: "OA-TDAH-003",
        title: "Escribir copy responsable para landing y app",
        agent: "copywriter",
        estimateDays: 1,
        acceptanceCriteria: [
          "El copy aclara que el producto es educativo y no sustituir diagnostico ni tratamiento profesional.",
          "El CTA invita a un piloto revisado en lugar de prometer resultados terapeuticos.",
        ],
      },
      {
        id: "OA-TDAH-004",
        title: "Prototipar sesion interactiva breve",
        agent: "design",
        estimateDays: 2,
        acceptanceCriteria: [
          "La actividad usa instrucciones cortas, descanso visible y controles simples.",
          "La interfaz evita sobrecarga visual y puede cerrarse facilmente por el adulto.",
        ],
      },
    ],
    landingPage: {
      headline: "Actividades educativas digitales para acompanar la atencion infantil",
      subheadline:
        "Crea sesiones breves, visuales y revisadas para ninos con TDAH, pensadas para padres, docentes y profesionales. No sustituye diagnostico ni tratamiento profesional.",
      primaryCta: "Solicitar piloto revisado",
      sections: [
        {
          title: "Microactividades",
          body: "Biblioteca de actividades de 3 a 10 minutos organizadas por edad, objetivo educativo y contexto de uso.",
        },
        {
          title: "Sesion guiada",
          body: "Constructor simple para combinar actividades, pausas y recompensas visuales en una rutina clara.",
        },
        {
          title: "Uso responsable",
          body: "Privacidad, consentimiento adulto y revision profesional incorporados desde el primer piloto.",
        },
      ],
    },
    pricing: [
      {
        name: "Familia piloto",
        price: "USD 9-15/mes",
        target: "Padres y cuidadores",
        includes: ["Biblioteca basica", "Sesiones guardadas", "Guias para adultos"],
      },
      {
        name: "Profesional",
        price: "USD 29-49/mes",
        target: "Psicopedagogos, terapeutas y orientadores",
        includes: ["Materiales revisados", "Plantillas de sesion", "Exportacion PDF"],
      },
      {
        name: "Colegio o gabinete",
        price: "Desde USD 99/mes",
        target: "Instituciones educativas y gabinetes",
        includes: ["Multiples adultos", "Biblioteca compartida", "Onboarding guiado"],
      },
    ],
    launchPlan7Days: [
      {
        day: 1,
        goal: "Validar dolor y comprador",
        actions: ["Entrevistar 3 padres", "Entrevistar 2 docentes o profesionales", "Separar deseos de necesidades pagables"],
      },
      {
        day: 2,
        goal: "Definir contenidos iniciales",
        actions: ["Elegir 20 microactividades", "Revisar lenguaje responsable", "Marcar limites no clinicos"],
      },
      {
        day: 3,
        goal: "Publicar landing piloto",
        actions: ["Explicar propuesta educativa", "Agregar disclaimer claro", "Capturar solicitudes de piloto"],
      },
      {
        day: 4,
        goal: "Prototipar experiencia",
        actions: ["Construir biblioteca minima", "Crear constructor de sesiones", "Preparar exportacion simple"],
      },
      {
        day: 5,
        goal: "Probar con adultos",
        actions: ["Hacer 3 pruebas guiadas", "Medir claridad y confianza", "Detectar sobrecarga visual"],
      },
      {
        day: 6,
        goal: "Ajustar seguridad",
        actions: ["Revisar privacidad", "Reducir datos sensibles", "Validar textos con profesional"],
      },
      {
        day: 7,
        goal: "Abrir piloto cerrado",
        actions: ["Invitar 10 usuarios", "Agendar feedback semanal", "Definir metrica de utilidad"],
      },
    ],
    firstCustomerPlan: [
      "Contactar psicopedagogos y terapeutas ocupacionales con audiencia activa de familias o colegios.",
      "Ofrecer un piloto revisado para 10 familias con feedback semanal y precio fundador.",
      "Crear una demo de 3 actividades listas para usar en casa, aula o consulta educativa.",
      "Vender primero a profesionales o colegios si el pago directo de familias es lento.",
    ],
    risks: [
      "Riesgo de claims medicos: el producto debe ser educativo y no sustituir diagnostico ni tratamiento profesional.",
      "Riesgo de privacidad infantil: se necesitan consentimiento adulto, minimizacion de datos y RLS desde el inicio.",
      "Riesgo de confianza: sin revision de profesionales, el contenido puede percibirse como poco seguro.",
    ],
  };
}

function buildGenericPlan(input: SaaSBuilderInput): GeneratedSaaSPlan {
  const ideaTitle = titleFromIdea(input.idea);
  const vertical = inferVertical(input.idea);
  const audience = input.audience?.trim() || `equipos pequenos de ${vertical}`;
  const region = input.region?.trim() || "mercados hispanohablantes";

  return {
    nicheValidation: {
      verdict: "promising",
      score: 74,
      summary: `${ideaTitle} tiene potencial si se enfoca en un dolor operativo frecuente, medible y con comprador claro. La primera validacion debe probar urgencia, presupuesto y repeticion del problema antes de ampliar funcionalidades.`,
      marketSignals: [
        {
          label: "Dolor repetitivo",
          strength: "high",
          rationale: `El segmento de ${audience} suele pagar cuando una tarea manual impacta tiempo, ventas o seguimiento.`,
        },
        {
          label: "Diferenciacion inicial",
          strength: "medium",
          rationale: "La ventaja debe venir de una implementacion vertical y resultados rapidos, no de decir que usa IA.",
        },
        {
          label: "Riesgo de scope creep",
          strength: "medium",
          rationale: "Conviene limitar el MVP a un workflow central con exportacion, historial y una metrica de valor.",
        },
      ],
    },
    valueProposition: `Una plataforma que ayuda a ${audience} a convertir ${ideaTitle.toLowerCase()} en un flujo operativo mas rapido, medible y vendible en ${region}.`,
    targetUsers: [
      `Duenos o responsables operativos de ${vertical}`,
      "Fundadores no tecnicos que necesitan validar una solucion vertical",
      "Equipos de ventas o soporte que dependen de seguimiento manual",
    ],
    mvpFeatures: [
      {
        name: "Diagnostico guiado del caso de uso",
        priority: "P0",
        owner: "research",
        outcome: "Captura problema, comprador, frecuencia, presupuesto y datos disponibles.",
      },
      {
        name: "Generador de plan MVP",
        priority: "P0",
        owner: "developer",
        outcome: "Produce arquitectura, backlog, landing y plan de lanzamiento en una ejecucion.",
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
        outcome: "Convierte el analisis en una pagina base para captar leads.",
      },
      {
        name: "Score de validacion",
        priority: "P1",
        owner: "qa",
        outcome: "Prioriza ideas por claridad de nicho, urgencia y facilidad de distribucion.",
      },
    ],
    technicalArchitecture: {
      stack: [
        "Next.js App Router",
        "React",
        "Tailwind CSS",
        "shadcn/ui",
        "Prisma",
        "PostgreSQL/Supabase",
        "OpenAI API opcional",
      ],
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
        title: "Disenar Command Center",
        agent: "design",
        estimateDays: 1,
        acceptanceCriteria: ["Formulario claro", "Estados de carga/error", "Resultados escaneables"],
      },
      {
        id: "OA-SB-003",
        title: "Versionar prompts",
        agent: "copywriter",
        estimateDays: 1,
        acceptanceCriteria: ["Prompt fuera de UI", "Version visible en cada run", "Salida JSON documentada"],
      },
      {
        id: "OA-SB-004",
        title: "Agregar persistencia Postgres",
        agent: "automation",
        estimateDays: 2,
        acceptanceCriteria: ["Schema Prisma", "Migracion inicial", "Fallback local en desarrollo"],
      },
      {
        id: "OA-SB-005",
        title: "QA comercial del output",
        agent: "qa",
        estimateDays: 1,
        acceptanceCriteria: ["Riesgos explicitos", "Plan de clientes accionable", "Sin consejos genericos"],
      },
    ],
    landingPage: {
      headline: ideaTitle,
      subheadline: `Convierte un proceso critico de ${vertical} en una herramienta simple, medible y lista para vender.`,
      primaryCta: "Validar mi caso",
      sections: [
        {
          title: "Problema",
          body: `${audience} pierden tiempo y oportunidades cuando el seguimiento depende de planillas, mensajes sueltos o criterio manual.`,
        },
        {
          title: "Solucion",
          body: "Un flujo guiado que captura informacion, genera recomendaciones y deja un plan listo para ejecutar.",
        },
        {
          title: "Resultado",
          body: "Menos trabajo manual, mejor priorizacion y una forma clara de medir si la idea merece inversion.",
        },
      ],
    },
    pricing: [
      {
        name: "Validation",
        price: "USD 29/mes",
        target: "Fundadores validando una idea",
        includes: ["10 proyectos", "SaaS Builder", "Landing draft", "Historial basico"],
      },
      {
        name: "Build",
        price: "USD 99/mes",
        target: "Equipos que ejecutan MVPs",
        includes: ["Proyectos ilimitados", "Backlog avanzado", "Exportacion", "Providers IA"],
      },
      {
        name: "Operator",
        price: "USD 499/mes",
        target: "Negocios que quieren ejecucion asistida",
        includes: ["Workspace privado", "Automatizaciones", "Soporte de implementacion", "Playbooks verticales"],
      },
    ],
    launchPlan7Days: [
      { day: 1, goal: "Definir nicho", actions: ["Elegir un vertical", "Escribir 20 hipotesis de dolor", "Preparar entrevista"] },
      { day: 2, goal: "Hablar con mercado", actions: ["Contactar 20 prospectos", "Hacer 5 entrevistas", "Registrar frases exactas"] },
      { day: 3, goal: "Cerrar oferta", actions: ["Elegir un dolor P0", "Definir promesa", "Crear landing"] },
      { day: 4, goal: "Prototipo", actions: ["Construir flujo central", "Agregar captura de leads", "Preparar demo"] },
      { day: 5, goal: "Venta piloto", actions: ["Enviar 30 mensajes", "Hacer 3 demos", "Ofrecer piloto pago"] },
      { day: 6, goal: "Entrega manual asistida", actions: ["Resolver con herramientas simples", "Medir tiempo ahorrado", "Documentar objeciones"] },
      { day: 7, goal: "Decision", actions: ["Revisar senales", "Ajustar pricing", "Elegir construir, pivotar o descartar"] },
    ],
    firstCustomerPlan: [
      "Crear lista de 50 negocios del nicho con dueno o responsable identificable.",
      "Enviar outreach con un dolor concreto, no con una descripcion del producto.",
      "Ofrecer diagnostico gratuito de 15 minutos y cerrar un piloto pago de bajo riesgo.",
      "Entregar el resultado manualmente antes de automatizar todo.",
    ],
    risks: [
      "Idea demasiado horizontal sin comprador especifico.",
      "Output de IA util pero no conectado a una tarea que alguien pague.",
      "Construir integraciones antes de validar el workflow central.",
    ],
  };
}

function buildPlan(input: SaaSBuilderInput): GeneratedSaaSPlan {
  if (isChildNeurodiversityIdea(input.idea)) {
    return buildSensitiveEducationPlan(input);
  }

  return buildGenericPlan(input);
}

export const localProvider: ModelProvider = {
  name: "local",

  async generateSaaSPlan({ input }) {
    return { plan: buildPlan(input) };
  },

  async regenerateSection({ input, artifactKey }: RegenerateSectionParams) {
    return { content: getArtifactContent(buildPlan(input), artifactKey) };
  },
};
