"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Archive,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Code2,
  Loader2,
  Megaphone,
  Rocket,
  Send,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { SaaSBuilderOutput } from "@/lib/omniagent/types";
import { agentRegistry } from "@/lib/omniagent/agents/registry";

type ProjectsResponse = {
  projects: SaaSBuilderOutput[];
};

const defaultIdea =
  "Una plataforma para que negocios de servicios automaticen seguimiento comercial, propuestas y recordatorios de clientes usando agentes IA.";

export function SaaSBuilderWorkbench() {
  const [idea, setIdea] = useState(defaultIdea);
  const [audience, setAudience] = useState("dueños de negocios de servicios B2B");
  const [region, setRegion] = useState("LatAm y España");
  const [constraints, setConstraints] = useState("MVP vendible en 7 días, sin integraciones complejas al inicio");
  const [project, setProject] = useState<SaaSBuilderOutput | null>(null);
  const [history, setHistory] = useState<SaaSBuilderOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data: ProjectsResponse) => {
        setHistory(data.projects ?? []);
        setProject((current) => current ?? data.projects?.[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  const activeAgents = useMemo(
    () => agentRegistry.filter((agent) => agent.role !== "automation"),
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/builders/saas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, audience, region, constraints }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo generar el proyecto.");
      }

      setProject(data);
      setHistory((items) => [data, ...items.filter((item) => item.id !== data.id)]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                OmniAgent MVP
              </Badge>
              <Badge variant="outline">SaaS Builder</Badge>
              <Badge variant="outline">Provider local por defecto</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                Command Center para crear micro-SaaS
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Ingresa una idea y OmniAgent genera validación, propuesta, arquitectura, backlog,
                landing, pricing y plan de lanzamiento con un flujo modular de agentes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <Metric label="Proyectos" value={history.length.toString()} />
            <Metric label="Agentes" value={activeAgents.length.toString()} />
            <Metric label="Meta" value="7d" />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4" />
                  SaaS Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="idea">Idea</Label>
                    <Textarea
                      id="idea"
                      value={idea}
                      onChange={(event) => setIdea(event.target.value)}
                      className="min-h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Usuarios objetivo</Label>
                    <Input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="region">Mercado</Label>
                      <Input id="region" value={region} onChange={(event) => setRegion(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="constraints">Restricciones</Label>
                      <Input
                        id="constraints"
                        value={constraints}
                        onChange={(event) => setConstraints(event.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Ejecutar agentes
                  </Button>
                </form>
                {error ? (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Core de agentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAgents.map((agent) => (
                  <div key={agent.role} className="flex gap-3 rounded-md border border-border p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{agent.responsibility}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {project ? <ProjectResult project={project} /> : <EmptyState />}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Archive className="h-4 w-4" />
                  Historial de ejecuciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.length ? (
                  history.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/projects/${item.id}`}
                      onMouseEnter={() => setProject(item)}
                      className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm transition hover:bg-accent"
                    >
                      <span className="line-clamp-1">{item.input.idea}</span>
                      <Badge variant="outline">{item.provider}</Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Todavía no hay ejecuciones guardadas.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-md border border-border px-3 py-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex min-h-96 flex-col items-center justify-center gap-3 text-center">
        <BrainCircuit className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">Listo para ejecutar el primer builder.</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            El resultado aparecerá organizado por validación, negocio, arquitectura, backlog y lanzamiento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectResult({ project }: { project: SaaSBuilderOutput }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{project.landingPage.headline}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.valueProposition}</p>
            </div>
            <Badge className="gap-1">
              <Target className="h-3.5 w-3.5" />
              Score {project.nicheValidation.score}
            </Badge>
          </div>
          <Button asChild className="w-fit">
            <Link href={`/projects/${project.id}`}>Abrir proyecto</Link>
          </Button>
          <Separator />
          <div className="grid gap-3 md:grid-cols-3">
            <Summary icon={Users} label="Usuarios" value={project.targetUsers.length.toString()} />
            <Summary icon={ClipboardList} label="Backlog" value={project.backlog.length.toString()} />
            <Summary icon={Rocket} label="Launch" value="7 días" />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList className="grid h-auto grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="validation">Validación</TabsTrigger>
          <TabsTrigger value="product">Producto</TabsTrigger>
          <TabsTrigger value="tech">Arquitectura</TabsTrigger>
          <TabsTrigger value="go-to-market">Go-to-market</TabsTrigger>
          <TabsTrigger value="landing">Landing</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validación del nicho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">{project.nicheValidation.summary}</p>
              <div className="grid gap-3 md:grid-cols-3">
                {project.nicheValidation.marketSignals.map((signal) => (
                  <div key={signal.label} className="rounded-md border border-border p-3">
                    <Badge variant="secondary">{signal.strength}</Badge>
                    <p className="mt-2 text-sm font-medium">{signal.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{signal.rationale}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Features MVP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.mvpFeatures.map((feature) => (
                <div key={feature.name} className="flex gap-3 rounded-md border border-border p-3">
                  <Badge variant={feature.priority === "P0" ? "default" : "outline"}>{feature.priority}</Badge>
                  <div>
                    <p className="text-sm font-medium">{feature.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{feature.outcome}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Code2 className="h-4 w-4" />
                Arquitectura técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <ListBlock title="Stack" items={project.technicalArchitecture.stack} />
              <ListBlock title="Módulos" items={project.technicalArchitecture.modules} />
              <ListBlock title="Datos" items={project.technicalArchitecture.dataModel} />
              <ListBlock title="Integraciones" items={project.technicalArchitecture.integrations} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backlog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.backlog.map((item) => (
                <div key={item.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.id} · {item.title}</p>
                    <Badge variant="outline">{item.estimateDays}d</Badge>
                  </div>
                  <ul className="mt-2 list-inside list-disc text-xs leading-5 text-muted-foreground">
                    {item.acceptanceCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="go-to-market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="h-4 w-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {project.pricing.map((plan) => (
                <div key={plan.name} className="rounded-md border border-border p-3">
                  <p className="font-medium">{plan.name}</p>
                  <p className="mt-1 text-lg font-semibold">{plan.price}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4" />
                Plan de lanzamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.launchPlan7Days.map((step) => (
                <div key={step.day} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium">Día {step.day}: {step.goal}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.actions.join(" · ")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="landing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Landing page inicial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border p-4">
                <p className="text-2xl font-semibold">{project.landingPage.headline}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.landingPage.subheadline}</p>
                <Button className="mt-4">{project.landingPage.primaryCta}</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {project.landingPage.sections.map((section) => (
                  <div key={section.title} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-2 list-inside list-disc text-xs leading-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
