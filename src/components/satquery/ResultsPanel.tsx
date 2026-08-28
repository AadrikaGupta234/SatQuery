import { useState } from "react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useMapStore } from "@/stores/map-store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Satellite,
  MapPin,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Clock,
  Target,
} from "lucide-react";

export default function ResultsPanel() {
  const status = useAnalysisStore((s) => s.status);
  const imagery = useAnalysisStore((s) => s.imagery);
  const results = useAnalysisStore((s) => s.results);
  const confidence = useAnalysisStore((s) => s.confidence);
  const explanation = useAnalysisStore((s) => s.explanation);
  const activeFilters = useAnalysisStore((s) => s.activeFilters);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const activeLayers = useMapStore((s) => s.activeLayers);

  if (status !== "success" && status !== "error") return null;

  const changeMaskCount =
    results?.features.filter(
      (f) => (f.properties as any)?.type === "change_mask"
    ).length ?? 0;
  const highlightCount =
    results?.features.filter(
      (f) => (f.properties as any)?.type === "highlight"
    ).length ?? 0;
  const totalArea =
    results?.features
      .filter((f) => (f.properties as any)?.type === "change_mask")
      .reduce(
        (sum, f) => sum + (((f.properties as any)?.area_ha as number) ?? 0),
        0
      ) ?? 0;

  const layers = [
    ...(imagery
      ? [
          {
            id: "imagery-before",
            label: "Before imagery",
            icon: <Satellite className="size-3" />,
            checked: !!activeLayers["imagery-before"],
          },
          {
            id: "imagery-after",
            label: "After imagery",
            icon: <Satellite className="size-3" />,
            checked: !!activeLayers["imagery-after"],
          },
        ]
      : []),
    ...(changeMaskCount > 0
      ? [
          {
            id: "change-mask",
            label: "Change mask",
            icon: <Layers className="size-3" />,
            checked: !!activeLayers["change-mask"],
          },
        ]
      : []),
    ...(highlightCount > 0
      ? [
          {
            id: "highlight-region",
            label: "Highlights",
            icon: <MapPin className="size-3" />,
            checked: !!activeLayers["highlight-region"],
          },
        ]
      : []),
  ];

  return (
    <div className="absolute right-4 top-4 z-10 w-64 space-y-2">
      <Card className="border-border/50 bg-card/90 p-3 backdrop-blur-md">
        <div className="mb-2 flex items-center gap-1.5">
          <BarChart3 className="size-3.5 text-primary" />
          <span className="text-[11px] font-semibold">Analysis Results</span>
          <Badge
            variant={status === "success" ? "default" : "destructive"}
            className="ml-auto text-[9px] px-1.5 py-0"
          >
            {confidence}%
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBlock
            icon={<Target className="size-3" />}
            label="Changes"
            value={changeMaskCount}
          />
          <StatBlock
            icon={<MapPin className="size-3" />}
            label="Highlights"
            value={highlightCount}
          />
          {totalArea > 0 && (
            <StatBlock
              icon={<Layers className="size-3" />}
              label="Total Area"
              value={`${totalArea.toLocaleString()} ha`}
            />
          )}
          {imagery && (
            <StatBlock
              icon={<Clock className="size-3" />}
              label="Period"
              value={formatPeriod(imagery.dates[0], imagery.dates[1])}
            />
          )}
        </div>
        {explanation && (
          <p className="mt-2 border-t border-border/30 pt-2 text-[10px] leading-relaxed text-muted-foreground">
            {explanation}
          </p>
        )}
        {activeFilters.length > 0 && (
          <div className="mt-2 border-t border-border/30 pt-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
              Active filters
            </p>
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="mr-1 mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
              >
                {f.field} {f.op} {f.value}
              </span>
            ))}
          </div>
        )}
      </Card>
      {layers.length > 0 && (
        <LayerDisclosure layers={layers} onToggle={toggleLayer} />
      )}
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[9px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function LayerDisclosure({
  layers,
  onToggle,
}: {
  layers: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    checked: boolean;
  }>;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Card className="border-border/50 bg-card/90 p-0 backdrop-blur-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold"
      >
        <CheckCircle2 className="size-3 text-emerald-400" />
        {layers.length} layer{layers.length > 1 ? "s" : ""}
        {expanded ? (
          <ChevronDown className="ml-auto size-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="ml-auto size-3 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="space-y-0.5 border-t border-border/30 px-3 py-2">
          {layers.map((layer) => (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[11px] transition-colors hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={layer.checked}
                onChange={() => onToggle(layer.id)}
                className="size-3 rounded border-border accent-primary"
              />
              <span className="text-muted-foreground">{layer.icon}</span>
              <span className="flex-1 text-foreground/80">{layer.label}</span>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}

function formatPeriod(a: Date, b: Date): string {
  const months = Math.round(
    Math.abs(b.getTime() - a.getTime()) / (30 * 24 * 60 * 60 * 1000)
  );
  if (months >= 12) return `${Math.round(months / 12)}y`;
  return `${months}mo`;
}
