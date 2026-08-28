import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  RotateCcw,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
  onSplitToggle: () => void;
  splitMode: boolean;
  activeLayerCount: number;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onExport,
  onSplitToggle,
  splitMode,
  activeLayerCount,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5">
      <ControlButton
        icon={<ZoomIn className="size-4" />}
        tooltip="Zoom in"
        onClick={onZoomIn}
      />
      <ControlButton
        icon={<ZoomOut className="size-4" />}
        tooltip="Zoom out"
        onClick={onZoomOut}
      />
      <ControlButton
        icon={<Crosshair className="size-4" />}
        tooltip="Reset view"
        onClick={onReset}
      />

      <div className="my-1 h-px bg-border/50" />

      <ControlButton
        icon={<SplitSquareVertical className="size-4" />}
        tooltip="Split view"
        onClick={onSplitToggle}
        active={splitMode}
      />
      <ControlButton
        icon={<Layers className="size-4" />}
        tooltip={`${activeLayerCount} active layers`}
        badge={activeLayerCount}
        onClick={() => {}}
      />
      <ControlButton
        icon={<Download className="size-4" />}
        tooltip="Export"
        onClick={onExport}
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
}: {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-md border border-border/60 bg-card/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground",
            active && "border-primary/40 bg-primary/10 text-primary"
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
