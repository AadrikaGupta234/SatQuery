import { create } from "zustand";
import type { BBox } from "./map-store";

// ── Pipeline status ──────────────────────────────────────────────
export type PipelineStatus = "idle" | "processing" | "success" | "error";

// ── Imagery endpoints ────────────────────────────────────────────
export interface ImageryEndpoints {
  beforeUrl: string;
  afterUrl: string;
  dates: [Date, Date];
}

// ── Feature types ────────────────────────────────────────────────
export type FeatureType = "change_mask" | "highlight";

export interface ResultProperties {
  type: FeatureType;
  label?: string;
  changeType?: string;
  area_ha?: number;
  confidence?: number;
  severity?: string;
  [key: string]: unknown;
}

// ── Client-side filters ──────────────────────────────────────────
export interface FeatureFilter {
  field: string;
  op: "gt" | "lt" | "eq";
  value: number;
}

// ── Chat message ─────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: PipelineStatus;
}

// ── Store interface ──────────────────────────────────────────────
interface AnalysisStore {
  // Pipeline
  status: PipelineStatus;
  statusMessage: string;

  // Imagery
  imagery: ImageryEndpoints | null;

  // GeoJSON — unified FeatureCollection, typed features
  results: GeoJSON.FeatureCollection | null;

  // Metadata
  confidence: number;
  explanation: string;

  // Query context
  query: string;
  targetBBox: BBox | null;

  // Client-side filtering ("Converse" step)
  activeFilters: FeatureFilter[];
  filteredResults: () => GeoJSON.FeatureCollection | null;

  // Chat
  messages: ChatMessage[];

  // ── Individual setters (called by pipeline) ──
  setStatus: (status: PipelineStatus) => void;
  setStatusMessage: (msg: string) => void;
  setImagery: (imagery: ImageryEndpoints) => void;
  setChangeMask: (fc: GeoJSON.FeatureCollection) => void;
  setHighlights: (fc: GeoJSON.FeatureCollection) => void;
  setConfidence: (n: number) => void;
  setExplanation: (text: string) => void;
  setTargetBBox: (bbox: BBox) => void;

  // ── Convenience: start/complete/fail ──
  startPipeline: (query: string) => void;
  complete: (explanation: string) => void;
  fail: (reason: string) => void;
  reset: () => void;

  // ── Filters ──
  addFilter: (filter: FeatureFilter) => void;
  clearFilters: () => void;

  // ── Chat ──
  addMessage: (msg: ChatMessage) => void;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Merge changeMask + highlights into a single `results` FeatureCollection */
function mergeResults(
  changeMask: GeoJSON.FeatureCollection | null,
  highlights: GeoJSON.FeatureCollection | null
): GeoJSON.FeatureCollection | null {
  const features: GeoJSON.Feature[] = [];
  if (changeMask) features.push(...changeMask.features);
  if (highlights) features.push(...highlights.features);
  return features.length > 0 ? { type: "FeatureCollection", features } : null;
}

function applyFilters(
  fc: GeoJSON.FeatureCollection | null,
  filters: FeatureFilter[]
): GeoJSON.FeatureCollection | null {
  if (!fc || filters.length === 0) return fc;
  return {
    ...fc,
    features: fc.features.filter((f) =>
      filters.every((filter) => {
        const v = (f.properties as any)?.[filter.field];
        if (v === undefined) return false;
        if (filter.op === "gt") return v > filter.value;
        if (filter.op === "lt") return v < filter.value;
        return v === filter.value;
      })
    ),
  };
}

// ── Store ────────────────────────────────────────────────────────

interface AnalysisStoreState {
  _changeMask: GeoJSON.FeatureCollection | null;
  _highlights: GeoJSON.FeatureCollection | null;
}

export const useAnalysisStore = create<AnalysisStore & AnalysisStoreState>(
  (set, get) => ({
    status: "idle",
    statusMessage: "",
    imagery: null,
    results: null,
    _changeMask: null,
    _highlights: null,
    confidence: 0,
    explanation: "",
    query: "",
    targetBBox: null,
    activeFilters: [],
    messages: [],

    // ── Individual setters ──────────────────────────────────────

    setStatus: (status) => set({ status }),
    setStatusMessage: (statusMessage) => set({ statusMessage }),

    setImagery: (imagery) => set({ imagery }),

    setChangeMask: (fc) => {
      set((s) => {
        const _changeMask = fc;
        return {
          _changeMask,
          results: mergeResults(_changeMask, s._highlights),
        };
      });
    },

    setHighlights: (fc) => {
      set((s) => {
        const _highlights = fc;
        return {
          _highlights,
          results: mergeResults(s._changeMask, _highlights),
        };
      });
    },

    setConfidence: (confidence) => set({ confidence }),
    setExplanation: (explanation) => set({ explanation }),
    setTargetBBox: (targetBBox) => set({ targetBBox }),

    // ── Convenience ─────────────────────────────────────────────

    startPipeline: (query) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: Date.now(),
      };
      const procMsg: ChatMessage = {
        id: `proc-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "processing",
      };

      set({
        status: "processing",
        statusMessage: "Understanding query…",
        query,
        imagery: null,
        results: null,
        _changeMask: null,
        _highlights: null,
        confidence: 0,
        explanation: "",
        targetBBox: null,
        activeFilters: [],
        messages: [...get().messages, userMsg, procMsg],
      });
    },

    complete: (explanation) => {
      const msgs = get().messages;
      const lastProc = [...msgs]
        .reverse()
        .find(
          (m) =>
            m.role === "assistant" &&
            m.status !== "success" &&
            m.status !== "error"
        );

      set({
        status: "success",
        statusMessage: "",
        explanation,
        messages: msgs.map((m) =>
          m.id === lastProc?.id
            ? { ...m, content: explanation, status: "success" as const }
            : m
        ),
      });
    },

    fail: (reason) => {
      const msgs = get().messages;
      const lastProc = [...msgs]
        .reverse()
        .find(
          (m) =>
            m.role === "assistant" &&
            m.status !== "success" &&
            m.status !== "error"
        );

      set({
        status: "error",
        statusMessage: "",
        explanation: reason,
        messages: msgs.map((m) =>
          m.id === lastProc?.id
            ? { ...m, content: reason, status: "error" as const }
            : m
        ),
      });
    },

    reset: () =>
      set({
        status: "idle",
        statusMessage: "",
        imagery: null,
        results: null,
        _changeMask: null,
        _highlights: null,
        confidence: 0,
        explanation: "",
        query: "",
        targetBBox: null,
        activeFilters: [],
      }),

    // ── Filters ─────────────────────────────────────────────────

    addFilter: (filter) =>
      set((s) => ({ activeFilters: [...s.activeFilters, filter] })),
    clearFilters: () => set({ activeFilters: [] }),

    filteredResults: () => {
      const { results, activeFilters } = get();
      return applyFilters(results, activeFilters);
    },

    // ── Chat ────────────────────────────────────────────────────

    addMessage: (msg) =>
      set((s) => ({ messages: [...s.messages, msg] })),
  })
);
