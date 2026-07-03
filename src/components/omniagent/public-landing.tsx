import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileDown,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const FOUNDING_PILOT_PRICE = "USD 49/mes";
const FOUNDING_PILOT_SEATS = 10;

export function PublicLanding() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">OmniAgent</span>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Iniciar sesion</Link>
          </Button>
        </header>

        <section className="flex flex-col items-start gap-6">
          <Badge variant="secondary" className="gap-1">
            <Bot className="h-3.5 w-3.5" />
            Para agencias y consultores
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Converti cada idea de cliente en un plan de negocio listo para vender
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            OmniAgent toma una idea de producto o negocio y genera en minutos lo que hoy te lleva
            dias armar a mano: validacion del nicho con score honesto, backlog priorizado, landing,
            pricing y plan de lanzamiento de 7 dias. Vos entregas estrategia; OmniAgent hace el
            trabajo pesado.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Probar con mi primera idea
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Sin tarjeta para empezar. Plan piloto limitado a {FOUNDING_PILOT_SEATS} cupos.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StepCard
            icon={Target}
            step="1"
            title="Carga la idea"
            body="Idea, audiencia, mercado y restricciones. Dos minutos, sin formularios eternos."
          />
          <StepCard
            icon={Bot}
            step="2"
            title="OmniAgent genera el plan"
            body="Validacion con score en 5 dimensiones, propuesta de valor, features MVP, backlog con criterios de aceptacion, landing, pricing y plan de 7 dias."
          />
          <StepCard
            icon={FileDown}
            step="3"
            title="Editas, regeneras y entregas"
            body="Ajusta cada seccion con IA, exporta en Markdown o JSON y entrega a tu cliente un documento que se ve como semanas de trabajo."
          />
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold">Que incluye cada proyecto</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureItem text="Validacion del nicho con score 0-100 en 5 dimensiones y veredicto honesto" />
            <FeatureItem text="Backlog MVP con responsables y criterios de aceptacion testeables" />
            <FeatureItem text="Landing page inicial con copy orientado a venta" />
            <FeatureItem text="Pricing por segmento y plan de lanzamiento dia por dia" />
            <FeatureItem text="Plan de primeros clientes ejecutable manana mismo" />
            <FeatureItem text="Cada seccion regenerable con IA y editable antes de entregar" />
          </div>
        </section>

        <section>
          <Card className="border-primary/40">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Founding Pilot
                </Badge>
                <Badge variant="outline">Primeros {FOUNDING_PILOT_SEATS} cupos</Badge>
              </div>
              <CardTitle className="text-3xl">{FOUNDING_PILOT_PRICE}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Precio congelado de por vida para los fundadores del piloto. Cancelas cuando quieras.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <ul className="grid gap-2 sm:grid-cols-2">
                <PlanItem text="20 proyectos por mes" />
                <PlanItem text="Todas las secciones regenerables con IA" />
                <PlanItem text="Export Markdown y JSON" />
                <PlanItem text="Soporte directo del founder por email" />
              </ul>
              <Button asChild size="lg" className="gap-2">
                <Link href="/login">
                  Reservar mi cupo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <footer className="border-t border-border pb-4 pt-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>OmniAgent — planes de negocio generados con agentes IA.</span>
            <Link href="/login" className="underline-offset-4 hover:underline">
              Entrar
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StepCard({
  icon: Icon,
  step,
  title,
  body,
}: {
  icon: typeof Target;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <Badge variant="outline">Paso {step}</Badge>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-border p-3">
      <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

function PlanItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      {text}
    </li>
  );
}
