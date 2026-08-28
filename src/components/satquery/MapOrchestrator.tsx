import { useCallback, useMemo } from "react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useMapStore } from "@/stores/map-store";

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapOrchestrator() {
  const viewport = useMapStore((s) => s.viewport);
  const setViewport = useMapStore((s) => s.setViewport);
  const activeLayers = useMapStore((s) => s.activeLayers);
  const splitMode = useMapStore((s) => s.splitMode);
  const splitPosition = useMapStore((s) => s.splitPosition);

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

  // DeckGL overlay layers
  const deckLayers = useMemo(() => {
    const l: any[] = [];

    // Change mask polygons
    if (activeLayers.has("change-mask") && changeMask) {
      l.push(
        new GeoJsonLayer({
          id: "change-mask-layer",
          data: changeMask,
          filled: true,
          stroked: true,
          lineWidthMinPixels: 1,
          getFillColor: [255, 80, 80, 100],
          getLineColor: [255, 80, 80, 200],
          getLineWidth: 2,
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 80, 80, 180],
          getTooltip: ({ object }: any) =>
            object?.properties && {
              text: [
                object.properties.changeType,
                object.properties.area_ha
                  ? `${object.properties.area_ha} ha`
                  : null,
                object.properties.confidence
                  ? `${Math.round(object.properties.confidence * 100)}% confidence`
                  : null,
              ]
                .filter(Boolean)
                .join(" · "),
            },
        })
      );
    }

    // Highlight points / polygons
    if (activeLayers.has("highlight-region") && highlights) {
      l.push(
        new GeoJsonLayer({
          id: "highlight-layer",
          data: highlights,
          filled: true,
          stroked: true,
          getFillColor: [255, 200, 0, 160],
          getLineColor: [255, 200, 0, 240],
          getLineWidth: 3,
          pointRadiusMinPixels: 6,
          pointRadiusMaxPixels: 12,
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 200, 0, 200],
          getTooltip: ({ object }: any) =>
            object?.properties?.label && {
              text: object.properties.label,
            },
        })
      );
    }

    return l;
  }, [activeLayers, changeMask, highlights]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <DeckGL
        layers={deckLayers}
        viewState={viewport}
        onViewStateChange={onViewStateChange}
        controller={true}
      >
        <Map
          mapStyle={BASEMAP_STYLE}
          attributionControl={false}
          dragRotate={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Before/After imagery via TiTiler tile sources */}
          {imagery && activeLayers.has("imagery-before") && (
            <Source
              id="imagery-before"
              type="raster"
              tiles={[imagery.before]}
              tileSize={256}
              attribution="© satQuery"
            >
              <Layer
                id="imagery-before-layer"
                type="raster"
                paint={{
                  "raster-opacity": splitMode ? 1 : 0.85,
                  "raster-opacity-transition": { duration: 300 },
                }}
              />
            </Source>
          )}

          {imagery && activeLayers.has("imagery-after") && (
            <Source
              id="imagery-after"
              type="raster"
              tiles={[imagery.after]}
              tileSize={256}
              attribution="© satQuery"
            >
              <Layer
                id="imagery-after-layer"
                type="raster"
                paint={{
                  "raster-opacity": 0.85,
                  "raster-opacity-transition": { duration: 300 },
                }}
              />
            </Source>
          )}
        </Map>
      </DeckGL>

      {/* Split view divider */}
      {splitMode && imagery && (
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-primary shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          style={{ left: `${splitPosition}%` }}
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
