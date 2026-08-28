import { create } from "zustand";
import type { BBox } from "./map-store";

// ── Pipeline status ──────────────────────────────────────────────
// Simplified per spec: idle | processing | success | error
// The "thinking" sub-states (understanding, searching, etc.) are
// internal to the pipeline and exposed via statusMessage.
export type PipelineStatus = "idle" | "processing" | "success" | "error";

// ── Imagery endpoints ────────────────────────────────────────────
export interface ImageryEndpoints {
  beforeUrl: string; // TiTiler tile URL template: /tiles/{z}/{x}/{y}
  afterUrl: string;
  dates: [Date, Date];
}

// ── GeoJSON result features ──────────────────────────────────────
// Each feature has a `type` property so the layer system styles it:
//   "change_mask"  → neon yellow fill + orange stroke
//   "highlight"    → red fill, responds to follow-up filters
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

// ── Store ────────────────────────────────────────────────────────
interface AnalysisStore {
  // Pipeline
  status: PipelineStatus;
  statusMessage: string; // e.g. "Searching imagery archives…"
  startPipeline: (query: string) => void;
  setImagery: (imagery: ImageryEndpoints) => void;
  setResults: (fc: GeoJSON.FeatureCollection) => void;
  complete: (explanation: string) => void;
  fail: (reason: string) => void;
  reset: () => void;

  // Imagery (set mid-pipeline by Reveal step)
  imagery: ImageryEndpoints | null;

  // GeoJSON results — single FeatureCollection, features typed by `type`
  results: GeoJSON.FeatureCollection | null;

  // Metadata
  confidence: number; // 0-100
  explanation: string;

  // Query context
  query: string;
  targetBBox: BBox | null;

  // Client-side filtering for follow-up queries ("Converse" step)
  // activeFilters narrow `results` without re-fetching imagery
  activeFilters: FeatureFilter[];
  addFilter: (filter: FeatureFilter) => void;
  clearFilters: () => void;

  // Derived: filtered results view (consumed by DeckGL layers)
  filteredResults: () => GeoJSON.FeatureCollection | null;

  // Chat history
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: PipelineStatus;
}

export interface FeatureFilter {
  field: string; // e.g. "area_ha"
  op: "gt" | "lt" | "eq";
  value: number;
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
        switch (filter.op) {
          case "gt":
            return v > filter.value;
          case "lt":
            return v < filter.value;
          case "eq":
            return v === filter.value;
        }
      })
    ),
  };
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  status: "idle",
  statusMessage: "",
  imagery: null,
  results: null,
  confidence: 0,
  explanation: "",
  query: "",
  targetBBox: null,
  activeFilters: [],
  messages: [],

  // ── Pipeline actions ──────────────────────────────────────────

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
      confidence: 0,
      explanation: "",
      activeFilters: [],
      messages: [...get().messages, userMsg, procMsg],
    });
  },

  setImagery: (imagery) => {
    set({ imagery, statusMessage: "Loading imagery…" });
  },

  setResults: (fc) => {
    set({ results: fc, statusMessage: "Running change detection…" });
  },

  complete: (explanation) => {
    const msgs = get().messages;
    const lastProc = [...msgs]
      .reverse()
      .find(
        (m) => m.role === "assistant" && m.status !== "success" && m.status !== "error"
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
        (m) => m.role === "assistant" && m.status !== "success" && m.status !== "error"
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
      confidence: 0,
      explanation: "",
      query: "",
      targetBBox: null,
      activeFilters: [],
    }),

  // ── Client-side filtering ("Converse" step) ───────────────────

  addFilter: (filter) =>
    set((s) => ({ activeFilters: [...s.activeFilters, filter] })),

  clearFilters: () => set({ activeFilters: [] }),

  filteredResults: () => {
    const { results, activeFilters } = get();
    return applyFilters(results, activeFilters);
  },

  // ── Chat ──────────────────────────────────────────────────────

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
}));
