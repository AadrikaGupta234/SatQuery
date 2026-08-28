import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  Satellite,
  Layers,
  ScanSearch,
  MapPin,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: ScanSearch,
    title: "AI-Powered Change Detection",
    description:
      "Ask natural-language questions. Our model finds changes across satellite imagery archives automatically.",
  },
  {
    icon: Layers,
    title: "Before / After Comparison",
    description:
      "Swipe between dates with split-view. See exactly what changed, where, and by how much.",
  },
  {
    icon: MapPin,
    title: "Interactive GeoJSON Results",
    description:
      "Click any detected region for details. Filter results client-side without re-fetching imagery.",
  },
  {
    icon: Globe,
    title: "Multi-Region Analysis",
    description:
      "From Amazon deforestation to urban sprawl in Delhi — analyze any region on Earth in seconds.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-grid text-foreground">
      {/* Nav */}
      <header className="relative z-10 border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Satellite className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              satQuery
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate("/auth")}
          >
            Sign in <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/[0.06] blur-[120px]" />

        <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Satellite Imagery Analysis
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Detect changes
              <br />
              <span className="text-primary">from space</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ask questions about satellite imagery in natural language. Get
              change masks, before/after comparisons, and confidence-scored
              results — all on an interactive map.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 px-6"
                onClick={() => navigate("/auth")}
              >
                Start analyzing
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-6"
                onClick={() => navigate("/auth")}
              >
                <Zap className="size-4" />
                View demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for analysis
            </h2>
            <p className="mt-2 text-muted-foreground">
              From query to change mask in seconds. Nothing you don't need.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <f.icon className="size-4.5" />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground/60">
          satQuery v1.0 — Satellite Imagery Analysis
        </div>
      </footer>
    </div>
  );
}
