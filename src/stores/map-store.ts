import { create } from "zustand";

export type BBox = [number, number, number, number]; // [west, south, east, north]

interface Viewport {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface MapStore {
  // Viewport
  viewport: Viewport;
  flyTo: (target: BBox, opts?: { duration?: number }) => void;

  // Split view for before/after comparison
  splitMode: boolean;
  toggleSplitMode: () => void;

  // Layer visibility — Record<string, boolean> for serializability
  activeLayers: Record<string, boolean>;
  toggleLayer: (layerId: string) => void;
  setLayerVisible: (layerId: string, visible: boolean) => void;

  // Left panel
  panelOpen: boolean;
  togglePanel: () => void;
}

function bboxCenter(bbox: BBox): { longitude: number; latitude: number } {
  return {
    longitude: (bbox[0] + bbox[2]) / 2,
    latitude: (bbox[1] + bbox[3]) / 2,
  };
}

function bboxZoom(bbox: BBox): number {
  const lngDelta = Math.abs(bbox[2] - bbox[0]);
  const latDelta = Math.abs(bbox[3] - bbox[1]);
  const maxDelta = Math.max(lngDelta, latDelta);
  return Math.min(Math.max(Math.log2(360 / maxDelta) - 0.5, 2), 16);
}

export const useMapStore = create<MapStore>((set, get) => ({
  viewport: {
    longitude: -60.0,
    latitude: -2.8,
    zoom: 6,
    pitch: 0,
    bearing: 0,
  },

  flyTo: (target, opts) => {
    const center = bboxCenter(target);
    const zoom = bboxZoom(target);
    set({
      viewport: {
        ...get().viewport,
        longitude: center.longitude,
        latitude: center.latitude,
        zoom,
      },
    });
  },

  splitMode: false,
  toggleSplitMode: () => set((s) => ({ splitMode: !s.splitMode })),

  activeLayers: {},
  toggleLayer: (layerId) =>
    set((s) => ({
      activeLayers: {
        ...s.activeLayers,
        [layerId]: !s.activeLayers[layerId],
      },
    })),
  setLayerVisible: (layerId, visible) =>
    set((s) => ({
      activeLayers: { ...s.activeLayers, [layerId]: visible },
    })),

  panelOpen: true,
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}));
