import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import TextHoverEffect from "@/components/satquery/TextHoverEffect";
import TextGenerateEffect from "@/components/satquery/TextGenerateEffect";
import Spotlight from "@/components/satquery/Spotlight";
import Carousel from "@/components/satquery/Carousel";
import {
  Satellite,
  ArrowRight,
  Zap,
  Layers,
  MessageSquare,
  Globe,
  ScanSearch,
  SplitSquareVertical,
} from "lucide-react";

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
      'Ask questions like "Show urban expansion in Delhi 2021–2025" and get mapped results instantly.',
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
    <div className="min-h-[100dvh] bg-background bg-grid text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary sm:size-8">
              <Satellite className="size-3.5 sm:size-4" />
            </div>
            <span className="text-xs font-semibold tracking-tight sm:text-sm">
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

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Spotlight />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/[0.06] blur-[120px] sm:h-[600px] sm:w-[900px]" />

        <div className="mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[10px] sm:text-xs text-muted-foreground backdrop-blur-sm sm:mb-6">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Satellite Imagery Analysis
            </div>

            {/* TextHoverEffect: smaller viewBox on mobile */}
            <div className="h-20 w-full sm:h-28 lg:h-36">
              <TextHoverEffect text="SATQUERY" duration={0.15} />
            </div>

            <div className="mx-auto mt-4 max-w-xl sm:mt-5">
              <TextGenerateEffect
                words="Ask questions about satellite imagery in natural language. Get change masks, before/after comparisons, and confidence-scored results — all on an interactive map."
                className="text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg text-center"
                duration={0.4}
              />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="gap-2 px-5 sm:px-6"
                onClick={() => navigate("/auth")}
              >
                Start analyzing
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-5 sm:px-6"
                onClick={() => navigate("/auth")}
              >
                <Zap className="size-4" />
                View demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────── */}
      <section className="relative z-10 border-t border-border/50 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center sm:mb-14"
          >
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              Built for analysis
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              From query to change mask in seconds. Nothing you don't need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
            {/* Before / After Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 sm:col-span-2 lg:col-span-1"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SplitSquareVertical className="size-5" />
              </div>
              <h3 className="text-sm font-semibold sm:text-base">Before / After</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Compare any two dates side-by-side with an interactive swipe slider.
                TiTiler-rendered COGs load instantly as you drag.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Layers className="size-2.5" /> Split view
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <ScanSearch className="size-2.5" /> COG tiles
                </span>
              </div>
            </motion.div>

            {/* Natural Language Queries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="text-sm font-semibold sm:text-base">Natural Language Queries</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Ask questions like &ldquo;Show urban expansion in Delhi 2021–2025&rdquo; and get mapped results instantly.
                Follow-up filters refine results client-side.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <MessageSquare className="size-2.5" /> NLP
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Zap className="size-2.5" /> Instant
                </span>
              </div>
            </motion.div>

            {/* Multi-Region Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-5" />
              </div>
              <h3 className="text-sm font-semibold sm:text-base">Multi-Region Analysis</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                From Amazon deforestation to Mekong floods — analyze any region on Earth.
                AI-powered change detection across satellite archives.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Globe className="size-2.5" /> Global
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <ScanSearch className="size-2.5" /> AI detection
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Carousel showcase ──────────────────────────────────── */}
      <section className="relative z-10 border-t border-border/50 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-14"
        >
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Built for analysis
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            From query to change mask in seconds. Nothing you don't need.
          </p>
        </motion.div>

        <Carousel slides={slideData} />
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-[10px] sm:text-xs text-muted-foreground/60 sm:px-6">
          satQuery v1.0 — Satellite Imagery Analysis
        </div>
      </footer>
    </div>
  );
}
