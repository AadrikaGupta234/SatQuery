import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useMapStore } from "@/stores/map-store";
import {
  useAnalysisStore,
  type ImageryEndpoints,
  type FeatureFilter,
} from "@/stores/analysis-store";
import ChatInterface from "./ChatInterface";
import ResultsPanel from "./ResultsPanel";
import MapOrchestrator from "./MapOrchestrator";
import MapLibreBasemap from "./MapLibreBasemap";
import MapControls from "./MapControls";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { BBox } from "@/stores/map-store";

// ── Follow-up parser ─────────────────────────────────────────────
// Detects filter intent from natural language follow-ups.
// Returns null if not a filter query (treats as a new analysis).
function parseFollowUpFilter(query: string): FeatureFilter | null {
  const lower = query.toLowerCase();

  // "changes > 1 hectare" / "area > 500"
  const gtMatch = lower.match(
    /(?:changes?|area|size)\s*>\s*(\d+)/
  );
  if (gtMatch) {
    return { field: "area_ha", op: "gt", value: Number(gtMatch[1]) };
  }

  // "changes < 100 ha"
  const ltMatch = lower.match(
    /(?:changes?|area|size)\s*<\s*(\d+)/
  );
  if (ltMatch) {
    return { field: "area_ha", op: "lt", value: Number(ltMatch[1]) };
  }

  // "confidence > 90" / "high confidence (>90%)"
  const confMatch = lower.match(
    /(?:confidence|conf)\s*>?\s*\(?\s*(\d+)/
  );
  if (confMatch) {
    return { field: "confidence", op: "gt", value: Number(confMatch[1]) / 100 };
  }

  return null;
}

// ── Simulated pipeline ───────────────────────────────────────────
// In production: Convex action → TiTiler + model inference
interface SimResult {
  imagery: ImageryEndpoints;
  results: GeoJSON.FeatureCollection;
  confidence: number;
  explanation: string;
  targetBBox: BBox;
}

function runPipeline(
  query: string,
  onImagery: (imagery: ImageryEndpoints) => void,
  onResults: (fc: GeoJSON.FeatureCollection) => void,
  onComplete: (explanation: string, bbox: BBox) => void,
  onError: (reason: string) => void
) {
  const store = useAnalysisStore.getState();
  const lower = query.toLowerCase();
  const now = new Date();
  const before = new Date(now);
  before.setMonth(before.getMonth() - 6);

  const imagery: ImageryEndpoints = {
    beforeUrl: "https://tiles.example.com/before/{z}/{x}/{y}.png",
    afterUrl: "https://tiles.example.com/after/{z}/{x}/{y}.png",
    dates: [before, now],
  };

  let results: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  let confidence = 84;
  let explanation = "Analysis complete. Results displayed on map.";
  let targetBBox: BBox = [-61, -4, -59, -2];

  if (lower.includes("deforest") || lower.includes("amazon")) {
    results = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-60.5, -3.2],
                [-60.2, -3.2],
                [-60.2, -2.9],
                [-60.5, -2.9],
                [-60.5, -3.2],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "deforestation",
            area_ha: 1240,
            confidence: 0.92,
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-59.8, -2.5],
                [-59.5, -2.5],
                [-59.5, -2.2],
                [-59.8, -2.2],
                [-59.8, -2.5],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "deforestation",
            area_ha: 890,
            confidence: 0.87,
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-60.35, -3.05] },
          properties: {
            type: "highlight",
            label: "Primary clearing event",
            severity: "high",
          },
        },
      ],
    };
    confidence = 92;
    explanation =
      "Detected 2,130 ha of deforestation across the Amazon basin in the last 6 months. Primary clearing event at −60.35°, −3.05° with 92% confidence.";
  } else if (lower.includes("urban") || lower.includes("nairobi")) {
    targetBBox = [36.5, -1.6, 37.2, -0.9];
    results = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [36.7, -1.4],
                [37.0, -1.4],
                [37.0, -1.1],
                [36.7, -1.1],
                [36.7, -1.4],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "urban_expansion",
            area_ha: 3200,
            confidence: 0.88,
          },
        },
      ],
    };
    confidence = 88;
    explanation =
      "Detected 3,200 ha of urban expansion around Nairobi since 2023. Growth corridor identified heading northeast.";
  } else if (lower.includes("flood") || lower.includes("mekong")) {
    targetBBox = [105.5, 9.2, 107.0, 10.5];
    results = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [106.0, 10.0],
                [106.5, 10.0],
                [106.5, 9.5],
                [106.0, 9.5],
                [106.0, 10.0],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "flooding",
            area_ha: 8500,
            confidence: 0.95,
          },
        },
      ],
    };
    confidence = 95;
    explanation =
      "Detected 8,500 ha of inundation along the Mekong Delta. Flood extent mapped with 95% confidence.";
  } else {
    results = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-60.5, -3.5],
                [-59.5, -3.5],
                [-59.5, -2.5],
                [-60.5, -2.5],
                [-60.5, -3.5],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "surface_change",
            area_ha: 4100,
            confidence: 0.84,
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-60.0, -3.0] },
          properties: {
            type: "highlight",
            label: "Area of interest",
            severity: "medium",
          },
        },
      ],
    };
    explanation =
      "General change detection complete. 4,100 ha of surface change detected.";
  }

  // ── Pipeline timeline ────────────────────────────────────────
  // Think (understand + search)
  setTimeout(() => {
    useAnalysisStore.setState({ statusMessage: "Searching imagery archives…" });
  }, 400);

  // Reveal imagery
  setTimeout(() => {
    useAnalysisStore.setState({ statusMessage: "Loading imagery…" });
    onImagery(imagery);
  }, 800);

  // Reveal results
  setTimeout(() => {
    useAnalysisStore.setState({ statusMessage: "Running change detection…" });
    onResults(results);
  }, 1400);

  // Complete
  setTimeout(() => {
    onComplete(explanation, targetBBox);
  }, 2200);
}

// ── Component ────────────────────────────────────────────────────
export default function SatQueryApp() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const panelOpen = useMapStore((s) => s.panelOpen);

  const handleSend = useCallback((query: string) => {
    const store = useAnalysisStore.getState();

    // ── "Converse" step: client-side filter ──
    if (store.status === "success" && store.results) {
      const filter = parseFollowUpFilter(query);
      if (filter) {
        store.addFilter(filter);
        store.addMessage({
          id: `user-${Date.now()}`,
          role: "user",
          content: query,
          timestamp: Date.now(),
        });
        store.addMessage({
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

    // Step 1: Ask
    store.startPipeline(query);

    // Steps 2-5: Think → Focus → Reveal
    runPipeline(
      query,
      // Set imagery
      (imagery) => {
        useAnalysisStore.getState().setImagery(imagery);
      },
      // Set results
      (fc) => {
        useAnalysisStore.getState().setResults(fc);
      },
      // Complete → enables layers, flyTo
      (explanation, bbox) => {
        useAnalysisStore.getState().complete(explanation);

        const map = useMapStore.getState();
        // Step 3: Focus — smooth flyTo to target
        map.flyTo(bbox, { duration: 1200 });
        // Step 4: Reveal — mount layers
        map.setLayerVisible("imagery-before", true);
        map.setLayerVisible("imagery-after", true);
        map.setLayerVisible("change-mask", true);
        map.setLayerVisible("highlight-region", true);
      },
      // Error
      (reason) => {
        useAnalysisStore.getState().fail(reason);
      }
    );
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
        {/* Left — ChatInterface (NLP Input & Contextual Follow-ups) */}
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

        {/* Right — MapOrchestrator (Main Map Container) */}
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
