"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, Save, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { isEditableArtifactKey, type EditableArtifact } from "@/lib/omniagent/artifacts";
import { formatBacklogCopy, formatLandingCopy } from "@/lib/omniagent/exports/project-export";
import type { SaaSBuilderOutput } from "@/lib/omniagent/types";

type ProjectArtifactEditorProps = {
  projectId: string;
  initialArtifacts: EditableArtifact[];
  initialIdea: string;
};

type RegenerateRunInfo = {
  provider: string;
  fallbackFrom?: string;
  costUsd?: number;
};

export function ProjectArtifactEditor({
  projectId,
  initialArtifacts,
  initialIdea,
}: ProjectArtifactEditorProps) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [activeKey, setActiveKey] = useState(initialArtifacts[0]?.key ?? "validation");
  const [drafts, setDrafts] = useState(() => createDrafts(initialArtifacts));
  const [idea, setIdea] = useState(initialIdea);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeArtifact = useMemo(
    () => artifacts.find((artifact) => artifact.key === activeKey),
    [activeKey, artifacts],
  );

  async function saveArtifact() {
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const content = JSON.parse(drafts[activeKey] ?? "{}");
      const response = await fetch(`/api/projects/${projectId}/artifacts/${activeKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar el artefacto.");
      }

      setArtifacts(data.artifacts);
      setDrafts(createDrafts(data.artifacts));
      setMessage("Artefacto guardado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyArtifact(key: "landing" | "backlog") {
    setError(null);
    setMessage(null);

    try {
      const content = JSON.parse(drafts[key] ?? "null");
      const text =
        key === "landing"
          ? formatLandingCopy(content as SaaSBuilderOutput["landingPage"])
          : formatBacklogCopy(content as SaaSBuilderOutput["backlog"]);

      await navigator.clipboard.writeText(text);
      setMessage(key === "landing" ? "Landing copiada al portapapeles." : "Backlog copiado al portapapeles.");
    } catch {
      setError("No se pudo copiar. Revisa que el contenido sea JSON valido.");
    }
  }

  async function regenerateArtifact() {
    setError(null);
    setMessage(null);
    setIsRegenerating(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifactKey: activeKey, idea }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo regenerar la seccion.");
      }

      setArtifacts(data.artifacts);
      setDrafts(createDrafts(data.artifacts));
      setMessage(regenerateMessage(data.run));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado.");
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-md border border-border p-3">
        <Label htmlFor="project-idea">Idea del proyecto</Label>
        <Textarea
          id="project-idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          className="min-h-20 resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Podes ajustar la idea antes de regenerar una seccion: la regeneracion usa este texto y lo
          guarda como idea del proyecto.
        </p>
      </div>

      <Tabs
        value={activeKey}
        onValueChange={(value) => {
          if (isEditableArtifactKey(value)) {
            setActiveKey(value);
          }
        }}
        className="space-y-4"
      >
        <TabsList className="grid h-auto grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {artifacts.map((artifact) => (
            <TabsTrigger key={artifact.key} value={artifact.key}>
              {artifact.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {artifacts.map((artifact) => (
          <TabsContent key={artifact.key} value={artifact.key} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">{artifact.title}</h2>
                  <Badge variant="outline">{artifact.key}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{artifact.description}</p>
              </div>
              <div className="flex gap-2">
                {artifact.key === "landing" || artifact.key === "backlog" ? (
                  <Button
                    onClick={() => copyArtifact(artifact.key as "landing" | "backlog")}
                    disabled={isSaving || isRegenerating}
                    variant="ghost"
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                ) : null}
                <Button
                  onClick={regenerateArtifact}
                  disabled={isRegenerating || isSaving}
                  variant="outline"
                  className="gap-2"
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Regenerar con IA
                </Button>
                <Button onClick={saveArtifact} disabled={isSaving || isRegenerating} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar
                </Button>
              </div>
            </div>
            <Textarea
              value={drafts[artifact.key] ?? ""}
              onChange={(event) =>
                setDrafts((current) => ({ ...current, [artifact.key]: event.target.value }))
              }
              className="min-h-[460px] resize-y font-mono text-xs leading-5"
              spellCheck={false}
            />
          </TabsContent>
        ))}
      </Tabs>

      {message ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Listo</AlertTitle>
          <AlertDescription>
            {message} {activeArtifact ? `Ultima seccion: ${activeArtifact.title}.` : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo completar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function regenerateMessage(run?: RegenerateRunInfo) {
  if (!run) {
    return "Seccion regenerada.";
  }

  const parts = [`Seccion regenerada con provider ${run.provider}.`];

  if (run.fallbackFrom) {
    parts.push(`Fallback desde ${run.fallbackFrom}.`);
  }

  if (typeof run.costUsd === "number") {
    parts.push(`Costo aproximado: USD ${run.costUsd.toFixed(4)}.`);
  }

  return parts.join(" ");
}

function createDrafts(artifacts: EditableArtifact[]) {
  return Object.fromEntries(
    artifacts.map((artifact) => [
      artifact.key,
      JSON.stringify(artifact.content, null, 2),
    ]),
  );
}
