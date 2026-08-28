import { useState, useRef, useEffect } from "react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Satellite,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStatus } from "@/stores/analysis-store";

const SUGGESTIONS = [
  "Show deforestation in Amazon basin last 6 months",
  "Detect urban sprawl around Nairobi since 2023",
  "Compare crop health in Punjab between monsoon seasons",
  "Identify flood damage along Mekong Delta",
];

const STATUS_LABELS: Record<PipelineStatus, string> = {
  idle: "",
  understanding: "Understanding query…",
  searching: "Searching imagery archives…",
  processing: "Running change detection…",
  success: "Analysis complete",
  error: "Analysis failed",
};

interface ChatInterfaceProps {
  onSend: (query: string) => void;
}

export default function ChatInterface({ onSend }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useAnalysisStore((s) => s.messages);
  const status = useAnalysisStore((s) => s.status);

  const processing =
    status !== "idle" && status !== "success" && status !== "error";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || processing) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (s: string) => {
    if (!processing) onSend(s);
  };

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Satellite className="size-3.5" />
        </div>
        <div>
          <h2 className="text-xs font-semibold">satQuery</h2>
          <p className="text-[10px] text-muted-foreground">
            Satellite Imagery Analysis
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div ref={scrollRef} className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted/50">
                <Satellite className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Ask about satellite imagery
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Detect changes, compare dates, analyze regions
              </p>
              <div className="mt-4 flex flex-col gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-md border border-border/40 bg-muted/30 px-3 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-8 bg-primary/10 text-foreground"
                    : "mr-8 bg-muted/50 text-foreground/90"
                )}
              >
                {msg.content}
              </div>

              {msg.role === "assistant" &&
                msg.status &&
                msg.status !== "success" &&
                msg.status !== "error" && (
                  <div className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>{STATUS_LABELS[msg.status]}</span>
                  </div>
                )}

              {msg.role === "assistant" && msg.status === "error" && (
                <div className="ml-2 flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  <span>
                    {msg.content || "Analysis failed. Try a different query."}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what to analyze…"
            rows={1}
            disabled={processing}
            className="flex-1 resize-none rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
          />
          <Button
            size="icon"
            className="size-9 shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim() || processing}
          >
            {processing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/50">
          {processing
            ? STATUS_LABELS[status]
            : "Enter to send · Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
}
