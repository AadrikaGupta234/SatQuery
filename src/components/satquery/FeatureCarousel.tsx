import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SplitSquareVertical,
  MessageSquare,
  Globe,
  Layers,
  ScanSearch,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: { label: string; icon: React.ReactNode }[];
}

const FEATURES: FeatureCard[] = [
  {
    title: "Before / After",
    description:
      "Compare any two dates side-by-side with an interactive swipe slider. TiTiler-rendered COGs load instantly as you drag.",
    icon: <SplitSquareVertical className="size-6" />,
    tags: [
      { label: "Split view", icon: <Layers className="size-2.5" /> },
      { label: "COG tiles", icon: <ScanSearch className="size-2.5" /> },
    ],
  },
  {
    title: "Natural Language Queries",
    description:
      'Ask questions like \u201cShow urban expansion in Delhi 2021\u20132025\u201d and get mapped results instantly. Follow-up filters refine results client-side.',
    icon: <MessageSquare className="size-6" />,
    tags: [
      { label: "NLP", icon: <MessageSquare className="size-2.5" /> },
      { label: "Instant", icon: <Zap className="size-2.5" /> },
    ],
  },
  {
    title: "Multi-Region Analysis",
    description:
      "From Amazon deforestation to Mekong floods \u2014 analyze any region on Earth. AI-powered change detection across satellite archives.",
    icon: <Globe className="size-6" />,
    tags: [
      { label: "Global", icon: <Globe className="size-2.5" /> },
      { label: "AI detection", icon: <ScanSearch className="size-2.5" /> },
    ],
  },
];

export default function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = FEATURES.length;

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > active ? 1 : -1);
      setActive(index);
    },
    [active]
  );

  const next = useCallback(() => {
    setDirection(1);
    setActive((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((i) => (i - 1 + count) % count);
  }, [count]);

  // Auto-play
  useEffect(() => {
    if (paused) {
      if (autoRef.current) clearInterval(autoRef.current);
      return;
    }
    autoRef.current = setInterval(next, 5000);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [paused, next]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    }
  };

  // Compute card positions: -1 = left, 0 = center, 1 = right
  const getRelativeIndex = (index: number) => {
    let diff = index - active;
    // Wrap around for infinite feel
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Feature carousel"
    >
      {/* Cards track */}
      <div className="relative mx-auto flex h-[320px] items-center justify-center sm:h-[340px] lg:h-[360px]">
        {FEATURES.map((feature, i) => {
          const rel = getRelativeIndex(i);
          const isActive = rel === 0;

          // Only render cards that are within view (-1, 0, 1)
          if (Math.abs(rel) > 1) return null;

          return (
            <motion.div
              key={feature.title}
              layout
              onClick={() => {
                if (!isActive) goTo(i);
              }}
              className={`absolute cursor-pointer rounded-2xl border p-6 sm:p-8 backdrop-blur-sm transition-shadow ${
                isActive
                  ? "border-primary/40 bg-card/80 shadow-[0_0_30px_rgba(56,189,248,0.08)] z-20"
                  : "border-border/40 bg-card/50 z-10 hover:border-border/60"
              }`}
              initial={false}
              animate={{
                x: rel * 340,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: 0.9,
              }}
              style={{
                width: "min(420px, 80vw)",
              }}
            >
              {/* Icon */}
              <div
                className={`mb-5 flex size-12 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className={`text-base font-semibold sm:text-lg transition-colors ${
                  isActive ? "text-foreground" : "text-foreground/70"
                }`}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className={`mt-3 text-xs leading-relaxed sm:text-sm transition-colors ${
                  isActive
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {feature.description}
              </p>

              {/* Tags */}
              <div className="mt-5 flex items-center gap-2">
                {feature.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground/60"
                    }`}
                  >
                    {tag.icon}
                    {tag.label}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={prev}
          className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground"
          aria-label="Previous feature"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Pagination dots */}
        <div className="flex items-center gap-2">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "bg-primary w-5 h-2"
                  : "bg-muted-foreground/30 w-2 h-2 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to feature ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground"
          aria-label="Next feature"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
