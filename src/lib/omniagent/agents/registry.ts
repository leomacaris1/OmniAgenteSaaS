import type { AgentRole } from "@/lib/omniagent/types";

export type AgentDefinition = {
  role: AgentRole;
  name: string;
  responsibility: string;
};

export const agentRegistry: AgentDefinition[] = [
  {
    role: "ceo",
    name: "CEO Agent",
    responsibility: "Decide positioning, product scope, and tradeoffs.",
  },
  {
    role: "research",
    name: "Research Agent",
    responsibility: "Validate niche, market pressure, alternatives, and demand signals.",
  },
  {
    role: "business-analyst",
    name: "Business Analyst Agent",
    responsibility: "Translate the opportunity into segments, pricing, and business model.",
  },
  {
    role: "developer",
    name: "Developer Agent",
    responsibility: "Design architecture, stack, data model, and implementation backlog.",
  },
  {
    role: "design",
    name: "Design Agent",
    responsibility: "Shape user flows, landing page structure, and product experience.",
  },
  {
    role: "marketing",
    name: "Marketing Agent",
    responsibility: "Plan launch, acquisition channels, and conversion experiments.",
  },
  {
    role: "copywriter",
    name: "Copywriter Agent",
    responsibility: "Create clear value proposition, headline, and landing copy.",
  },
  {
    role: "sales",
    name: "Sales Agent",
    responsibility: "Define first-customer outreach and qualification motion.",
  },
  {
    role: "automation",
    name: "Automation Agent",
    responsibility: "Identify automations and repeatable workflows inside the MVP.",
  },
  {
    role: "qa",
    name: "QA Agent",
    responsibility: "Find risks, testable acceptance criteria, and validation gaps.",
  },
];

export function getAgentName(role: AgentRole) {
  return agentRegistry.find((agent) => agent.role === role)?.name ?? role;
}
