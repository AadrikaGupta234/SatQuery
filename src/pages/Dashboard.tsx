import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import ChatInterface, {
  type ChatMessage,
  type AnalysisResult,
} from "@/components/satquery/ChatInterface";
import MapOrchestrator from "@/components/satquery/MapOrchestrator";
import MapControls from "@/components/satquery/MapControls";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LogOut, Maximize2, Minimize2 } from "lucide-react";

// Simulated analysis results for demo queries
function simulateResults(query: string): AnalysisResult[] {
  const lower = query.toLowerCase();
  if (lower.includes("deforest") || lower.includes("amazon")) {
    return [
      {
        type: "change_mask",
        label: "Deforestation mask (2024 Q1–Q2)",
        description: "Detected clearing events",
        visible: true,
        layerId: "change-mask",
        confidence: 0.92,
      },
      {
        type: "highlight",
        label: "Primary hot spot",
        description: "Largest detected change",
        visible: true,
        layerId: "highlight-region",
        confidence: 0.97,
      },
    ];
  }
  if (lower.includes("urban") || lower.includes("sprawl") || lower.includes("nairobi")) {
    return [
      {
        type: "change_mask",
        label: "Urban expansion mask",
        description: "New built-up areas detected",
        visible: true,
        layerId: "change-mask",
        confidence: 0.88,
      },
      {
        type: "highlight",
        label: "Growth corridor",
        description: "Primary expansion direction",
        visible: true,
        layerId: "highlight-region",
        confidence: 0.91,
      },
    ];
  }
  if (lower.includes("flood") || lower.includes("mekong")) {
    return [
      {
        type: "change_mask",
        label: "Flood extent mask",
        description: "Inundated area detected",
        visible: true,
        layerId: "change-mask",
        confidence: 0.95,
      },
    ];
  }
  // Default / generic
  return [
    {
      type: "change_mask",
      label: "General change detection",
      description: "Significant surface changes",
      visible: true,
      layerId: "change-mask",
      confidence: 0.84,
    },
    {
      type: "highlight",
      label: "Area of interest",
      description: "Highlighted region",
      visible: true,
      layerId: "highlight-region",
      confidence: 0.89,
    },
  ];
}

const DEFAULT_VIEW = {
  longitude: -60.0,
  latitude: -2.8,
  zoom: 6,
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(["satellite-tiles"])
  );
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const [splitMode, setSplitMode] = useState(false);
  const [leftExpanded, setLeftExpanded] = useState(true);

  // Simulated streaming query handler
  const handleSend = useCallback(
    (query: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: Date.now(),
      };

      const processingMsg: ChatMessage = {
        id: `proc-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "processing",
      };

      setMessages((prev) => [...prev, userMsg, processingMsg]);
      setProcessing(true);

      // Simulate analysis delay
      setTimeout(() => {
        const results = simulateResults(query);
        const responseText = `Found ${results.length} analysis layer${results.length > 1 ? "s" : ""} for your query. Toggle visibility in the results panel or on the map.`;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === processingMsg.id
              ? {
                  ...m,
                  content: responseText,
                  status: "complete" as const,
                  results,
                }
              : m
          )
        );

        // Auto-enable detected layers
        setActiveLayers((prev) => {
          const next = new Set(prev);
          results.forEach((r) => next.add(r.layerId));
          return next;
        });

        setProcessing(false);
      }, 1800);
    },
    []
  );

  const handleToggleLayer = useCallback((layerId: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  const handleZoomIn = () =>
    setViewState((v) => ({ ...v, zoom: Math.min(v.zoom + 1, 18) }));
  const handleZoomOut = () =>
    setViewState((v) => ({ ...v, zoom: Math.max(v.zoom - 1, 1) }));
  const handleReset = () => setViewState(DEFAULT_VIEW);
  const handleExport = () => {
    // Placeholder — real export would serialize active GeoJSON layers
    const data = JSON.stringify(
      {
        format: "satquery-export-v1",
        timestamp: new Date().toISOString(),
        viewState,
        activeLayers: [...activeLayers],
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "satquery-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Collect all results from messages for the map
  const allResults = useMemo(
    () => messages.flatMap((m) => m.results ?? []),
    [messages]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        {/* Top bar */}
        <header className="z-20 flex h-11 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-semibold tracking-tight">
              satQuery
            </h1>
            <span className="h-3 w-px bg-border/50" />
            <span className="text-[11px] text-muted-foreground">
              Satellite Imagery Analysis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Connected
            </div>
            <span className="text-[11px] text-muted-foreground">
              {user?.name ?? "Operator"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </header>

        {/* Main split layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel — Chat + Results */}
          <div
            className="flex flex-col border-r border-border/50 transition-all duration-300"
            style={{ width: leftExpanded ? 380 : 0, minWidth: leftExpanded ? 380 : 0 }}
          >
            {leftExpanded && (
              <ChatInterface
                messages={messages}
                onSend={handleSend}
                processing={processing}
                onToggleLayer={handleToggleLayer}
                activeLayers={activeLayers}
              />
            )}
          </div>

          {/* Resize handle (click to toggle) */}
          <button
            onClick={() => setLeftExpanded(!leftExpanded)}
            className="group flex w-1.5 shrink-0 items-center justify-center border-r border-border/30 bg-transparent transition-colors hover:bg-primary/10"
            title={leftExpanded ? "Collapse panel" : "Expand panel"}
          >
            <div className="h-8 w-0.5 rounded-full bg-border/60 transition-colors group-hover:bg-primary/60" />
          </button>

          {/* Right panel — Map */}
          <div className="relative flex-1">
            <MapOrchestrator
              activeLayers={activeLayers}
              results={allResults}
              viewState={viewState}
              onViewStateChange={setViewState}
            />
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
              onExport={handleExport}
              onSplitToggle={() => setSplitMode(!splitMode)}
              splitMode={splitMode}
              activeLayerCount={activeLayers.size}
            />

            {/* Map legend overlay */}
            {activeLayers.has("change-mask") && (
              <div className="absolute bottom-4 right-4 z-10 rounded-md border border-border/50 bg-card/80 px-3 py-2 backdrop-blur-sm">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Legend
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="size-2.5 rounded-sm bg-red-400/70" />
                    <span className="text-muted-foreground">Change mask</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="size-2.5 rounded-sm bg-amber-300" />
                    <span className="text-muted-foreground">Highlight</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
