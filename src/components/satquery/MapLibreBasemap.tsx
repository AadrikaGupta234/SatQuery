import Map, { NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/**
 * MapLibre vector basemap — rendered as a child of DeckGL
 * so that DeckGL overlays sit on top correctly.
 */
export default function MapLibreBasemap() {
  return (
    <Map
      mapStyle={BASEMAP_STYLE}
      attributionControl={false}
      dragRotate={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
    </Map>
  );
}
