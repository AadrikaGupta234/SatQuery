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
  transitionDuration: number;
  setViewport: (partial: Partial<Viewport>) => void;
  setTransitionDuration: (ms: number) => void;
  flyTo: (target: BBox, opts?: { duration?: number; padding?: number }) => void;

  // Split view for before/after comparison
  splitMode: boolean;
  splitPosition: number; // 0-100%
  toggleSplitMode: () => void;
  setSplitPosition: (pos: number) => void;

  // Layer visibility
  activeLayers: Set<string>;
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
  transitionDuration: 1200,

  setViewport: (partial) =>
    set((s) => ({ viewport: { ...s.viewport, ...partial } })),

  setTransitionDuration: (ms) => set({ transitionDuration: ms }),

  flyTo: (target, opts) => {
    const center = bboxCenter(target);
    const zoom = bboxZoom(target);
    const duration = opts?.duration ?? get().transitionDuration;
    // Set transition duration, then viewport — DeckGL interpolates
    set((s) => ({
      transitionDuration: duration,
      viewport: {
        ...s.viewport,
        longitude: center.longitude,
        latitude: center.latitude,
        zoom,
      },
    }));
  },

  splitMode: false,
  splitPosition: 50,
  toggleSplitMode: () => set((s) => ({ splitMode: !s.splitMode })),
  setSplitPosition: (pos) =>
    set({ splitPosition: Math.max(0, Math.min(100, pos)) }),

  activeLayers: new Set<string>(["satellite-tiles"]),
  toggleLayer: (layerId) =>
    set((s) => {
      const next = new Set(s.activeLayers);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return { activeLayers: next };
    }),
  setLayerVisible: (layerId, visible) =>
    set((s) => {
      const next = new Set(s.activeLayers);
      if (visible) next.add(layerId);
      else next.delete(layerId);
      return { activeLayers: next };
    }),

  panelOpen: true,
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}));
