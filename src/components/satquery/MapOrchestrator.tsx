import { useCallback, useMemo, type ReactNode } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useMapStore } from "@/stores/map-store";

interface MapOrchestratorProps {
  children?: ReactNode;
}

export default function MapOrchestrator({ children }: MapOrchestratorProps) {
  const viewport = useMapStore((s) => s.viewport);
  const splitMode = useMapStore((s) => s.splitMode);
  const activeLayers = useMapStore((s) => s.activeLayers);
  const setViewport = useMapStore((s) => s.setViewport);

  const imagery = useAnalysisStore((s) => s.imagery);
  const filteredResults = useAnalysisStore((s) => s.filteredResults);
  const status = useAnalysisStore((s) => s.status);

  const results = filteredResults();

  // Separate features by type for layer styling
  const changeMaskFeatures = useMemo(() => {
    if (!results) return null;
    const features = results.features.filter(
      (f) => (f.properties as any)?.type === "change_mask"
    );
    return features.length > 0
      ? ({ ...results, features } as GeoJSON.FeatureCollection)
      : null;
  }, [results]);

  const highlightFeatures = useMemo(() => {
    if (!results) return null;
    const features = results.features.filter(
      (f) => (f.properties as any)?.type === "highlight"
    );
    return features.length > 0
      ? ({ ...results, features } as GeoJSON.FeatureCollection)
      : null;
  }, [results]);

  const onViewStateChange = useCallback(
    ({ viewState }: any) => {
      setViewport({
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
      });
    },
    [setViewport]
  );

  const onFeatureClick = useCallback((info: any) => {
    console.log("[satQuery] Feature clicked:", info.object?.properties);
  }, []);

  // DeckGL layer stack (bottom to top)
  const layers = useMemo(() => {
    const l: any[] = [];

    // 1. Imagery — Before
    l.push(
      new TileLayer({
        id: "imagery-before",
        data: imagery?.beforeUrl ?? undefined,
        visible: activeLayers.has("imagery-before"),
        opacity: splitMode ? 0.5 : 1,
      })
    );

    // 2. Imagery — After (split mode only)
    l.push(
      new TileLayer({
        id: "imagery-after",
        data: imagery?.afterUrl ?? undefined,
        visible: activeLayers.has("imagery-after") && splitMode,
      })
    );

    // 3. Change Detection Mask — high contrast neon yellow
    if (changeMaskFeatures) {
      l.push(
        new GeoJsonLayer({
          id: "change-mask",
          data: changeMaskFeatures,
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

    // 4. Highlights — responds to follow-up filters
    if (highlightFeatures) {
      l.push(
        new GeoJsonLayer({
          id: "highlights",
          data: highlightFeatures,
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
  }, [
    imagery,
    changeMaskFeatures,
    highlightFeatures,
    splitMode,
    activeLayers,
    onFeatureClick,
  ]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DeckGL
        layers={layers}
        viewState={viewport}
        onViewStateChange={onViewStateChange}
        controller={true}
      >
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
