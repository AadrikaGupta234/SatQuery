import { useCallback, useMemo, type ReactNode } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useMapStore } from "@/stores/map-store";

interface MapOrchestratorProps {
  children?: ReactNode;
}

/**
 * Main map container.
 *
 * Renders DeckGL with analytics layers, and accepts children for
 * <MapLibreBasemap /> and <MapControls /> composition:
 *
 *   <MapOrchestrator>
 *     <DeckGL>
 *       <MapLibreBasemap />
 *     </DeckGL>
 *     <MapControls />
 *   </MapOrchestrator>
 */
export default function MapOrchestrator({ children }: MapOrchestratorProps) {
  const viewport = useMapStore((s) => s.viewport);
  const setViewport = useMapStore((s) => s.setViewport);
  const splitMode = useMapStore((s) => s.splitMode);
  const activeLayers = useMapStore((s) => s.activeLayers);

  const imagery = useAnalysisStore((s) => s.imagery);
  const changeMask = useAnalysisStore((s) => s.changeMask);
  const highlights = useAnalysisStore((s) => s.highlights);

  const onViewStateChange = useCallback(
    ({ viewState }: any) => {
      setViewport({
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom,
      });
    },
    [setViewport]
  );

  const onFeatureClick = useCallback((info: any) => {
    console.log("[satQuery] Feature clicked:", info.object?.properties);
  }, []);

  // DeckGL analytics layer stack
  const layers = useMemo(() => {
    const l: any[] = [];

    // 1. Satellite Imagery — Before
    l.push(
      new TileLayer({
        id: "imagery-before",
        data: imagery?.before ?? undefined,
        visible: activeLayers.has("imagery-before"),
        opacity: splitMode ? 0.5 : 1,
      })
    );

    // 2. Satellite Imagery — After (visible only in split mode)
    l.push(
      new TileLayer({
        id: "imagery-after",
        data: imagery?.after ?? undefined,
        visible: activeLayers.has("imagery-after") && splitMode,
      })
    );

    // 3. Change Detection Mask
    if (changeMask) {
      l.push(
        new GeoJsonLayer({
          id: "change-mask",
          data: changeMask,
          visible: activeLayers.has("change-mask"),
          filled: true,
          stroked: true,
          getFillColor: [255, 200, 0, 80],
          getLineColor: [255, 100, 0, 200],
          lineWidthMinPixels: 1,
          pickable: true,
          onFeatureClick,
          autoHighlight: true,
          highlightColor: [255, 200, 0, 160],
          getTooltip: ({ object }: any) =>
            object?.properties && {
              text: [
                object.properties.changeType,
                object.properties.area_ha
                  ? `${object.properties.area_ha} ha`
                  : null,
                object.properties.confidence
                  ? `${Math.round(object.properties.confidence * 100)}%`
                  : null,
              ]
                .filter(Boolean)
                .join(" · "),
            },
        })
      );
    }

    // 4. Highlighted Regions
    if (highlights) {
      l.push(
        new GeoJsonLayer({
          id: "highlights",
          data: highlights,
          visible: activeLayers.has("highlight-region"),
          filled: true,
          getFillColor: [255, 50, 50, 120],
          lineWidthMinPixels: 2,
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 50, 50, 200],
          getTooltip: ({ object }: any) =>
            object?.properties?.label && {
              text: object.properties.label,
            },
        })
      );
    }

    return l;
  }, [imagery, changeMask, highlights, splitMode, activeLayers, onFeatureClick]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* DeckGL wraps MapLibreBasemap as a child */}
      <DeckGL
        layers={layers}
        viewState={viewport}
        onViewStateChange={onViewStateChange}
        controller={true}
      >
        {/* MapLibreBasemap renders here as DeckGL child */}
        {children}
      </DeckGL>

      {/* Split view divider */}
      {splitMode && imagery && (
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-primary shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          style={{ left: "50%" }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex size-7 items-center justify-center rounded-full border border-primary/60 bg-background text-[9px] font-bold text-primary">
              ⇄
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
