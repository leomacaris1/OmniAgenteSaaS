"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { isEditableArtifactKey, type EditableArtifact } from "@/lib/omniagent/artifacts";

type ProjectArtifactEditorProps = {
  projectId: string;
  initialArtifacts: EditableArtifact[];
};

export function ProjectArtifactEditor({
  projectId,
  initialArtifacts,
}: ProjectArtifactEditorProps) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [activeKey, setActiveKey] = useState(initialArtifacts[0]?.key ?? "validation");
  const [drafts, setDrafts] = useState(() => createDrafts(initialArtifacts));
  const [isSaving, setIsSaving] = useState(false);
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

  return (
    <div className="space-y-4">
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
              <Button onClick={saveArtifact} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </Button>
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
          <AlertTitle>Guardado</AlertTitle>
          <AlertDescription>
            {message} {activeArtifact ? `Ultima seccion: ${activeArtifact.title}.` : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo guardar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function createDrafts(artifacts: EditableArtifact[]) {
  return Object.fromEntries(
    artifacts.map((artifact) => [
      artifact.key,
      JSON.stringify(artifact.content, null, 2),
    ]),
  );
}
