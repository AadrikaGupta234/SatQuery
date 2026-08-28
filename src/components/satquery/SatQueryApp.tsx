import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useMapStore } from "@/stores/map-store";
import { useAnalysisStore, type ImageryEndpoints } from "@/stores/analysis-store";
import ChatInterface from "./ChatInterface";
import ResultsPanel from "./ResultsPanel";
import MapOrchestrator from "./MapOrchestrator";
import MapLibreBasemap from "./MapLibreBasemap";
import MapControls from "./MapControls";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Simulated analysis pipeline — in production this calls a Convex action
function simulateAnalysis(
  query: string,
  resolve: (result: {
    imagery: ImageryEndpoints;
    changeMask: GeoJSON.FeatureCollection | null;
    highlights: GeoJSON.FeatureCollection | null;
    confidence: number;
    explanation: string;
    targetBBox?: [number, number, number, number];
  }) => void,
  reject: (reason: string) => void
) {
  const store = useAnalysisStore.getState();
  const lower = query.toLowerCase();

  store.setStatus("understanding");
  setTimeout(() => store.setStatus("searching"), 600);
  setTimeout(() => store.setStatus("processing"), 1200);

  setTimeout(() => {
    const now = new Date();
    const before = new Date(now);
    before.setMonth(before.getMonth() - 6);

    let changeMask: GeoJSON.FeatureCollection | null = null;
    let highlights: GeoJSON.FeatureCollection | null = null;
    let confidence = 84;
    let explanation = "Analysis complete. Results displayed on map.";

    if (lower.includes("deforest") || lower.includes("amazon")) {
      changeMask = {
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
            properties: { changeType: "deforestation", area_ha: 1240, confidence: 0.92 },
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
            properties: { changeType: "deforestation", area_ha: 890, confidence: 0.87 },
          },
        ],
      };
      highlights = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-60.35, -3.05] },
            properties: { label: "Primary clearing event", severity: "high" },
          },
        ],
      };
      confidence = 92;
      explanation =
        "Detected 2,130 ha of deforestation across the Amazon basin in the last 6 months. Primary clearing event at −60.35°, −3.05° with 92% confidence.";
    } else if (lower.includes("urban") || lower.includes("nairobi")) {
      changeMask = {
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
            properties: { changeType: "urban_expansion", area_ha: 3200, confidence: 0.88 },
          },
        ],
      };
      confidence = 88;
      explanation =
        "Detected 3,200 ha of urban expansion around Nairobi since 2023. Growth corridor identified heading northeast.";
    } else if (lower.includes("flood") || lower.includes("mekong")) {
      changeMask = {
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
            properties: { changeType: "flooding", area_ha: 8500, confidence: 0.95 },
          },
        ],
      };
      confidence = 95;
      explanation =
        "Detected 8,500 ha of inundation along the Mekong Delta. Flood extent mapped with 95% confidence.";
    } else {
      changeMask = {
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
            properties: { changeType: "surface_change", area_ha: 4100, confidence: 0.84 },
          },
        ],
      };
      highlights = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-60.0, -3.0] },
            properties: { label: "Area of interest", severity: "medium" },
          },
        ],
      };
      explanation =
        "General change detection complete. 4,100 ha of surface change detected.";
    }

    resolve({
      imagery: {
        before: `https://tiles.example.com/before/{z}/{x}/{y}.png`,
        after: `https://tiles.example.com/after/{z}/{x}/{y}.png`,
        dates: [before, now],
      },
      changeMask,
      highlights,
      confidence,
      explanation,
      targetBBox: [-61, -4, -59, -2] as [number, number, number, number],
    });
  }, 2200);
}

export default function SatQueryApp() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const panelOpen = useMapStore((s) => s.panelOpen);

  const handleSend = useCallback((query: string) => {
    useAnalysisStore.getState().startAnalysis(query);

    simulateAnalysis(
      query,
      (result) => {
        useAnalysisStore.getState().completeAnalysis(result);
        const map = useMapStore.getState();
        map.setLayerVisible("imagery-before", true);
        map.setLayerVisible("imagery-after", true);
        map.setLayerVisible("change-mask", true);
        map.setLayerVisible("highlight-region", true);
        if (result.targetBBox) map.flyTo(result.targetBBox);
      },
      (reason) => {
        useAnalysisStore.getState().failAnalysis(reason);
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
        {/* Left panel — ChatInterface (NLP Input & Contextual Follow-ups) */}
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
            {/* DeckGL child — Vector Basemap */}
            <MapLibreBasemap />
          </MapOrchestrator>

          {/* Floating controls */}
          <MapControls />

          {/* Floating results stats */}
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
}
