import { useCallback, useMemo, useRef, useState } from "react";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import { PolygonLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AnalysisResult } from "./ChatInterface";

// Placeholder demo GeoJSON for change masks
const DEMO_CHANGE_MASK: GeoJSON.FeatureCollection = {
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
        changeType: "deforestation",
        confidence: 0.92,
        area_ha: 1240,
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
        changeType: "deforestation",
        confidence: 0.87,
        area_ha: 890,
      },
    },
  ],
};

const DEMO_HIGHLIGHTS: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-60.35, -3.05],
      },
      properties: { label: "Primary hot spot", severity: "high" },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-59.65, -2.35],
      },
      properties: { label: "Secondary hot spot", severity: "medium" },
    },
  ],
};

interface MapOrchestratorProps {
  activeLayers: Set<string>;
  results: AnalysisResult[];
  viewState: { longitude: number; latitude: number; zoom: number };
  onViewStateChange: (vs: {
    longitude: number;
    latitude: number;
    zoom: number;
  }) => void;
}

const SATELLITE_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapOrchestrator({
  activeLayers,
  results,
  viewState,
  onViewStateChange,
}: MapOrchestratorProps) {
  const deckRef = useRef<any>(null);

  const layers = useMemo(() => {
    const l: any[] = [];

    // Base satellite tile overlay (subtle)
    if (activeLayers.has("satellite-tiles")) {
      l.push(
        new GeoJsonLayer({
          id: "satellite-tiles-bg",
          data: { type: "FeatureCollection", features: [] },
          pickable: false,
        })
      );
    }

    // Change mask polygons
    if (activeLayers.has("change-mask")) {
      l.push(
        new GeoJsonLayer({
          id: "change-mask-layer",
          data: DEMO_CHANGE_MASK,
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
              text: `${object.properties.changeType}: ${object.properties.area_ha} ha (${Math.round(object.properties.confidence * 100)}% confidence)`,
            },
        })
      );
    }

    // Highlight points / polygons
    if (activeLayers.has("highlight-region")) {
      l.push(
        new GeoJsonLayer({
          id: "highlight-layer",
          data: DEMO_HIGHLIGHTS,
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
            object?.properties && {
              text: object.properties.label,
            },
        })
      );
    }

    return l;
  }, [activeLayers]);

  const onHover = useCallback(() => {}, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg">
      <DeckGL
        ref={deckRef}
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) =>
          onViewStateChange({
            longitude: vs.longitude,
            latitude: vs.latitude,
            zoom: vs.zoom,
          })
        }
        controller={true}
        getTooltip={undefined}
      >
        <Map
          mapStyle={SATELLITE_STYLE}
          attributionControl={false}
          dragRotate={false}
        >
          <NavigationControl position="top-right" showCompass={false} />
        </Map>
      </DeckGL>
    </div>
  );
}
