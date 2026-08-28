import { useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useMapStore } from "@/stores/map-store";
import { useAnalysisStore, type FeatureFilter } from "@/stores/analysis-store";
import { processQuery } from "@/lib/ai-agent";
import { buildTiTilerUrl } from "@/lib/titiler";
import ChatInterface from "./ChatInterface";
import ResultsPanel from "./ResultsPanel";
import MapOrchestrator from "./MapOrchestrator";
import MapLibreBasemap from "./MapLibreBasemap";
import MapControls from "./MapControls";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// ── Follow-up filter parser ──────────────────────────────────────
function parseFollowUpFilter(query: string): FeatureFilter | null {
  const lower = query.toLowerCase();

  const gtArea = lower.match(/(?:changes?|area|size)\s*>\s*(\d+)/);
  if (gtArea) return { field: "area_ha", op: "gt", value: Number(gtArea[1]) };

  const ltArea = lower.match(/(?:changes?|area|size)\s*<\s*(\d+)/);
  if (ltArea) return { field: "area_ha", op: "lt", value: Number(ltArea[1]) };

  const gtConf = lower.match(/(?:confidence|conf)\s*\(?\s*>?\s*(\d+)/);
  if (gtConf)
    return {
      field: "confidence",
      op: "gt",
      value: Number(gtConf[1]) / 100,
    };

  return null;
}

// ── Interaction pipeline ─────────────────────────────────────────
async function handleQuery(query: string, signal: number) {
  const analysis = useAnalysisStore.getState();
  const map = useMapStore.getState();

  // ── "Converse" step: client-side filter ──
  if (analysis.status === "success" && analysis.results) {
    const filter = parseFollowUpFilter(query);
    if (filter) {
      analysis.addFilter(filter);
      analysis.addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: Date.now(),
      });
      analysis.addMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Filter applied: ${filter.field} ${filter.op} ${filter.value}. Map updated instantly.`,
        timestamp: Date.now(),
        status: "success",
      });
      return;
    }
  }

  // ── New analysis: Ask → Think → Focus → Reveal ──
  analysis.startPipeline(query);

  analysis.setStatusMessage("Understanding query…");
  const result = await processQuery(query);

  // Abort if a newer pipeline started while we were awaiting
  if (signal !== useAnalysisStore.getState()._pipelineId) return;

  analysis.setStatusMessage("Processing…");

  // ── Focus ──
  map.flyTo(result.boundingBox, { duration: 1200 });

  // ── Reveal imagery ──
  useAnalysisStore.getState().setImagery({
    beforeUrl: buildTiTilerUrl(result.beforeScene),
    afterUrl: buildTiTilerUrl(result.afterScene),
    dates: [result.startDate, result.endDate],
  });

  // Abort check after imagery
  if (signal !== useAnalysisStore.getState()._pipelineId) return;

  // ── Reveal results ──
  useAnalysisStore.getState().setChangeMask(result.changeMaskGeoJSON);
  if (result.highlightsGeoJSON) {
    useAnalysisStore.getState().setHighlights(result.highlightsGeoJSON);
  }
  useAnalysisStore.getState().setConfidence(result.confidence);

  // ── Enable layers ──
  const mapNow = useMapStore.getState();
  mapNow.setLayerVisible("imagery-before", true);
  mapNow.setLayerVisible("imagery-after", true);
  mapNow.setLayerVisible("change-mask", true);
  mapNow.setLayerVisible("highlight-region", true);

  // ── Done ──
  useAnalysisStore.getState().complete(result.explanation);
}

// ── Component ────────────────────────────────────────────────────
export default function SatQueryApp() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const panelOpen = useMapStore((s) => s.panelOpen);
  const pipelineIdRef = useRef(0);

  const handleSend = useCallback((query: string) => {
    const id = ++pipelineIdRef.current;
    // Write pipelineId into store so handleQuery can check it after await
    (useAnalysisStore.getState() as any)._pipelineId = id;

    handleQuery(query, id).catch((err) => {
      console.error("[satQuery] Pipeline failed:", err);
      useAnalysisStore.getState().fail("Analysis failed. Please try again.");
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="z-20 flex h-11 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-semibold tracking-tight">satQuery</h1>
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

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — ChatInterface */}
        <div
          className="flex flex-col border-r border-border/50 transition-all duration-300"
          style={{
            width: panelOpen ? 380 : 0,
            minWidth: panelOpen ? 380 : 0,
          }}
        >
          {panelOpen && <ChatInterface onSend={handleSend} />}
        </div>

        {/* Resize handle */}
        <button
          onClick={() => useMapStore.getState().togglePanel()}
          className="group flex w-1.5 shrink-0 items-center justify-center border-r border-border/30 bg-transparent transition-colors hover:bg-primary/10"
          title={panelOpen ? "Collapse panel" : "Expand panel"}
        >
          <div className="h-8 w-0.5 rounded-full bg-border/60 transition-colors group-hover:bg-primary/60" />
        </button>

        {/* Right — MapOrchestrator */}
        <div className="relative flex-1">
          <MapOrchestrator>
            <MapLibreBasemap />
          </MapOrchestrator>
          <MapControls />
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
}
