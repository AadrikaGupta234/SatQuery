import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import TextHoverEffect from "@/components/satquery/TextHoverEffect";
import TextGenerateEffect from "@/components/satquery/TextGenerateEffect";
import Spotlight from "@/components/satquery/Spotlight";
import Carousel from "@/components/satquery/Carousel";
import { Satellite, ArrowRight, Zap } from "lucide-react";

const slideData = [
  {
    title: "Change Detection",
    description:
      "AI identifies deforestation, urban growth, and flood damage across satellite imagery archives.",
    button: "Try it",
    src: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=3272&auto=format&fit=crop",
  },
  {
    title: "Before / After",
    description:
      "Compare any two dates side-by-side with interactive split-view and TiTiler-rendered COGs.",
    button: "Compare",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544&auto=format&fit=crop",
  },
  {
    title: "Natural Language Queries",
    description:
      "Ask questions like \"Show urban expansion in Delhi 2021–2025\" and get mapped results instantly.",
    button: "Ask now",
    src: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=3432&auto=format&fit=crop",
  },
  {
    title: "Multi-Region Analysis",
    description:
      "From Amazon deforestation to Mekong floods — analyze any region on Earth in seconds.",
    button: "Explore",
    src: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=3542&auto=format&fit=crop",
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
        <Spotlight />
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

            <div className="h-28 w-full sm:h-32 lg:h-36">
              <TextHoverEffect text="SATQUERY" duration={0.15} />
            </div>

            <div className="mx-auto mt-5 max-w-xl">
              <TextGenerateEffect
                words="Ask questions about satellite imagery in natural language. Get change masks, before/after comparisons, and confidence-scored results — all on an interactive map."
                className="text-base leading-relaxed text-muted-foreground sm:text-lg text-center"
                duration={0.4}
              />
            </div>

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

      {/* Features — 3D Carousel */}
      <section className="relative z-10 border-t border-border/50 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built for analysis
          </h2>
          <p className="mt-2 text-muted-foreground">
            From query to change mask in seconds. Nothing you don't need.
          </p>
        </motion.div>

        <Carousel slides={slideData} />
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
