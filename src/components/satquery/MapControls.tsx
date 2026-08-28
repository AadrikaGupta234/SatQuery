import { useMapStore } from "@/stores/map-store";
import { useAnalysisStore } from "@/stores/analysis-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  SplitSquareVertical,
  Layers,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapControls() {
  const viewport = useMapStore((s) => s.viewport);
  const splitMode = useMapStore((s) => s.splitMode);
  const toggleSplitMode = useMapStore((s) => s.toggleSplitMode);
  const panelOpen = useMapStore((s) => s.panelOpen);
  const togglePanel = useMapStore((s) => s.togglePanel);
  const activeLayers = useMapStore((s) => s.activeLayers);

  const imagery = useAnalysisStore((s) => s.imagery);
  const results = useAnalysisStore((s) => s.results);

  const layerCount =
    Object.values(activeLayers).filter(Boolean).length +
    (imagery ? 2 : 0) +
    (results?.features?.length ?? 0);

  const handleZoomIn = () =>
    useMapStore.setState({
      viewport: { ...viewport, zoom: Math.min(viewport.zoom + 1, 18) },
    });
  const handleZoomOut = () =>
    useMapStore.setState({
      viewport: { ...viewport, zoom: Math.max(viewport.zoom - 1, 1) },
    });
  const handleReset = () =>
    useMapStore.setState({
      viewport: {
        longitude: -60.0,
        latitude: -2.8,
        zoom: 6,
        pitch: 0,
        bearing: 0,
      },
    });

  const handleExport = () => {
    const analysis = useAnalysisStore.getState();
    const map = useMapStore.getState();
    const data = {
      format: "satquery-export-v1",
      timestamp: new Date().toISOString(),
      viewport: map.viewport,
      query: analysis.query,
      confidence: analysis.confidence,
      explanation: analysis.explanation,
      activeFilters: analysis.activeFilters,
      activeLayers: Object.entries(map.activeLayers).filter(([,v]) => v).map(([k]) => k),
      imagery: analysis.imagery
        ? { dates: analysis.imagery.dates.map((d) => d.toISOString()) }
        : null,
      results: analysis.results,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satquery-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5">
      <ControlButton
        icon={<PanelLeftClose className="size-4" />}
        tooltip={panelOpen ? "Collapse panel" : "Expand panel"}
        onClick={togglePanel}
      />

      <div className="my-0.5 h-px bg-border/50" />

      <ControlButton
        icon={<ZoomIn className="size-4" />}
        tooltip="Zoom in"
        onClick={handleZoomIn}
      />
      <ControlButton
        icon={<ZoomOut className="size-4" />}
        tooltip="Zoom out"
        onClick={handleZoomOut}
      />
      <ControlButton
        icon={<Maximize2 className="size-4" />}
        tooltip="Reset view"
        onClick={handleReset}
      />

      <div className="my-0.5 h-px bg-border/50" />

      <ControlButton
        icon={<SplitSquareVertical className="size-4" />}
        tooltip="Before / After split"
        onClick={toggleSplitMode}
        active={splitMode}
        disabled={!imagery}
      />
      <ControlButton
        icon={<Layers className="size-4" />}
        tooltip={`${layerCount} layers`}
        badge={layerCount}
        onClick={() => {}}
      />
      <ControlButton
        icon={<Download className="size-4" />}
        tooltip="Export analysis"
        onClick={handleExport}
      />
    </div>
  );
}

function ControlButton({
  icon,
  tooltip,
  onClick,
  active,
  badge,
  disabled,
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-md border border-border/60 bg-card/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground",
            active && "border-primary/40 bg-primary/10 text-primary",
            disabled && "opacity-40 pointer-events-none"
          )}
        >
          {icon}
          {badge !== undefined && badge > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {badge}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
