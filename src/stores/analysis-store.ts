import { create } from "zustand";
import type { BBox } from "./map-store";

export type PipelineStatus =
  | "idle"
  | "understanding"
  | "searching"
  | "processing"
  | "success"
  | "error";

export interface ImageryEndpoints {
  before: string; // TiTiler tile URL for "before" date
  after: string; // TiTiler tile URL for "after" date
  dates: [Date, Date];
}

export interface AnalysisMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: PipelineStatus;
  queryId?: string;
}

interface AnalysisStore {
  // Pipeline status
  status: PipelineStatus;
  setStatus: (status: PipelineStatus) => void;

  // Current query
  query: string;
  setQuery: (q: string) => void;

  // Imagery endpoints (dynamic TiTiler URLs)
  imagery: ImageryEndpoints | null;
  setImagery: (imagery: ImageryEndpoints | null) => void;

  // AI results (GeoJSON)
  changeMask: GeoJSON.FeatureCollection | null;
  setChangeMask: (fc: GeoJSON.FeatureCollection | null) => void;

  highlights: GeoJSON.FeatureCollection | null;
  setHighlights: (fc: GeoJSON.FeatureCollection | null) => void;

  // Metadata
  confidence: number; // 0-100
  setConfidence: (c: number) => void;

  explanation: string;
  setExplanation: (e: string) => void;

  // Target bounding box (for flyTo after analysis)
  targetBBox: BBox | null;
  setTargetBBox: (bbox: BBox | null) => void;

  // Chat history
  messages: AnalysisMessage[];
  addMessage: (msg: AnalysisMessage) => void;
  updateMessage: (id: string, patch: Partial<AnalysisMessage>) => void;

  // Full analysis cycle
  startAnalysis: (query: string) => void;
  completeAnalysis: (result: {
    imagery: ImageryEndpoints;
    changeMask: GeoJSON.FeatureCollection | null;
    highlights: GeoJSON.FeatureCollection | null;
    confidence: number;
    explanation: string;
    targetBBox?: BBox;
  }) => void;
  failAnalysis: (reason: string) => void;
  reset: () => void;
}

const INITIAL = {
  status: "idle" as const,
  query: "",
  imagery: null,
  changeMask: null,
  highlights: null,
  confidence: 0,
  explanation: "",
  targetBBox: null,
  messages: [],
};

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  ...INITIAL,

  setStatus: (status) => set({ status }),
  setQuery: (query) => set({ query }),
  setImagery: (imagery) => set({ imagery }),
  setChangeMask: (changeMask) => set({ changeMask }),
  setHighlights: (highlights) => set({ highlights }),
  setConfidence: (confidence) => set({ confidence }),
  setExplanation: (explanation) => set({ explanation }),
  setTargetBBox: (targetBBox) => set({ targetBBox }),

  messages: [],

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  startAnalysis: (query) => {
    const userMsg: AnalysisMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };
    const procMsg: AnalysisMessage = {
      id: `proc-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "understanding",
    };

    set((s) => ({
      status: "understanding",
      query,
      messages: [...s.messages, userMsg, procMsg],
      // Clear previous results
      imagery: null,
      changeMask: null,
      highlights: null,
      confidence: 0,
      explanation: "",
    }));
  },

  completeAnalysis: (result) => {
    const msgs = get().messages;
    const lastProc = [...msgs].reverse().find((m) => m.role === "assistant" && m.status !== "success" && m.status !== "error");

    set({
      status: "success",
      imagery: result.imagery,
      changeMask: result.changeMask,
      highlights: result.highlights,
      confidence: result.confidence,
      explanation: result.explanation,
      targetBBox: result.targetBBox ?? null,
      messages: msgs.map((m) =>
        m.id === lastProc?.id
          ? {
              ...m,
              content: result.explanation,
              status: "success" as const,
            }
          : m
      ),
    });
  },

  failAnalysis: (reason) => {
    const msgs = get().messages;
    const lastProc = [...msgs].reverse().find((m) => m.role === "assistant" && m.status !== "success" && m.status !== "error");

    set({
      status: "error",
      messages: msgs.map((m) =>
        m.id === lastProc?.id
          ? {
              ...m,
              content: reason,
              status: "error" as const,
            }
          : m
      ),
    });
  },

  reset: () => set({ ...INITIAL, messages: [] }),
}));
