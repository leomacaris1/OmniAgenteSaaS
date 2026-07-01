export type AgentRole =
  | "ceo"
  | "research"
  | "business-analyst"
  | "developer"
  | "design"
  | "marketing"
  | "copywriter"
  | "sales"
  | "automation"
  | "qa";

export type ProviderName = "local" | "openai";

export type SaaSBuilderInput = {
  idea: string;
  audience?: string;
  region?: string;
  constraints?: string;
};

export type MarketSignal = {
  label: string;
  strength: "low" | "medium" | "high";
  rationale: string;
};

export type MvpFeature = {
  name: string;
  priority: "P0" | "P1" | "P2";
  owner: AgentRole;
  outcome: string;
};

export type BacklogItem = {
  id: string;
  title: string;
  agent: AgentRole;
  estimateDays: number;
  acceptanceCriteria: string[];
};

export type LandingPageDraft = {
  headline: string;
  subheadline: string;
  primaryCta: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export type PricingPlan = {
  name: string;
  price: string;
  target: string;
  includes: string[];
};

export type LaunchStep = {
  day: number;
  goal: string;
  actions: string[];
};

export type SaaSBuilderOutput = {
  id: string;
  createdAt: string;
  provider: ProviderName;
  promptVersion: string;
  input: SaaSBuilderInput;
  nicheValidation: {
    verdict: "promising" | "needs-focus" | "risky";
    score: number;
    summary: string;
    marketSignals: MarketSignal[];
  };
  valueProposition: string;
  targetUsers: string[];
  mvpFeatures: MvpFeature[];
  technicalArchitecture: {
    stack: string[];
    modules: string[];
    dataModel: string[];
    integrations: string[];
  };
  backlog: BacklogItem[];
  landingPage: LandingPageDraft;
  pricing: PricingPlan[];
  launchPlan7Days: LaunchStep[];
  firstCustomerPlan: string[];
  risks: string[];
};

export type AgentRun = {
  id: string;
  projectId: string;
  createdAt: string;
  builder: "saas";
  provider: ProviderName;
  agents: AgentRole[];
  status: "completed" | "failed";
};
