import { describe, it, expect, beforeEach } from "vitest";
import { useAnalysisStore } from "../analysis-store";

// Reset store between tests
beforeEach(() => {
  useAnalysisStore.getState().reset();
});

describe("useAnalysisStore", () => {
  it("starts in idle state", () => {
    const s = useAnalysisStore.getState();
    expect(s.status).toBe("idle");
    expect(s.messages).toHaveLength(0);
    expect(s.results).toBeNull();
    expect(s.imagery).toBeNull();
  });

  it("startPipeline sets processing status and creates messages", () => {
    useAnalysisStore.getState().startPipeline("test query");
    const s = useAnalysisStore.getState();
    expect(s.status).toBe("processing");
    expect(s.query).toBe("test query");
    expect(s.messages).toHaveLength(2);
    expect(s.messages[0].role).toBe("user");
    expect(s.messages[0].content).toBe("test query");
    expect(s.messages[1].role).toBe("assistant");
    expect(s.messages[1].status).toBe("processing");
  });

  it("startPipeline clears previous results", () => {
    // Set some results first
    useAnalysisStore.getState().setConfidence(95);
    useAnalysisStore.getState().setChangeMask({
      type: "FeatureCollection",
      features: [],
    });

    // Start new pipeline
    useAnalysisStore.getState().startPipeline("new query");
    const s = useAnalysisStore.getState();
    expect(s.confidence).toBe(0);
    expect(s.results).toBeNull();
    expect(s.imagery).toBeNull();
  });

  it("complete updates last processing message", () => {
    useAnalysisStore.getState().startPipeline("q");
    useAnalysisStore.getState().complete("Done!");
    const s = useAnalysisStore.getState();
    expect(s.status).toBe("success");
    expect(s.explanation).toBe("Done!");
    const lastMsg = s.messages[s.messages.length - 1];
    expect(lastMsg.status).toBe("success");
    expect(lastMsg.content).toBe("Done!");
  });

  it("fail updates last processing message", () => {
    useAnalysisStore.getState().startPipeline("q");
    useAnalysisStore.getState().fail("Error occurred");
    const s = useAnalysisStore.getState();
    expect(s.status).toBe("error");
    const lastMsg = s.messages[s.messages.length - 1];
    expect(lastMsg.status).toBe("error");
    expect(lastMsg.content).toBe("Error occurred");
  });

  it("setChangeMask merges into results", () => {
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: { type: "change_mask", area_ha: 100 },
        },
      ],
    };
    useAnalysisStore.getState().setChangeMask(fc);
    const s = useAnalysisStore.getState();
    expect(s.results).not.toBeNull();
    expect(s.results!.features).toHaveLength(1);
    expect(s.results!.features[0].properties?.type).toBe("change_mask");
  });

  it("setHighlights merges into results alongside changeMask", () => {
    const mask: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: { type: "change_mask" },
        },
      ],
    };
    const hl: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [1, 1] },
          properties: { type: "highlight", label: "A" },
        },
      ],
    };
    useAnalysisStore.getState().setChangeMask(mask);
    useAnalysisStore.getState().setHighlights(hl);
    const s = useAnalysisStore.getState();
    expect(s.results!.features).toHaveLength(2);
  });

  it("reset clears everything", () => {
    useAnalysisStore.getState().startPipeline("q");
    useAnalysisStore.getState().setConfidence(88);
    useAnalysisStore.getState().reset();
    const s = useAnalysisStore.getState();
    expect(s.status).toBe("idle");
    expect(s.confidence).toBe(0);
    expect(s.results).toBeNull();
    expect(s.messages).toHaveLength(0);
  });

  it("addFilter appends to activeFilters", () => {
    useAnalysisStore.getState().addFilter({
      field: "area_ha",
      op: "gt",
      value: 100,
    });
    useAnalysisStore.getState().addFilter({
      field: "confidence",
      op: "gt",
      value: 0.9,
    });
    expect(useAnalysisStore.getState().activeFilters).toHaveLength(2);
  });

  it("clearFilters empties the array", () => {
    useAnalysisStore.getState().addFilter({
      field: "area_ha",
      op: "gt",
      value: 100,
    });
    useAnalysisStore.getState().clearFilters();
    expect(useAnalysisStore.getState().activeFilters).toHaveLength(0);
  });

  it("filteredResults applies filters to results", () => {
    useAnalysisStore.getState().setChangeMask({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: { type: "change_mask", area_ha: 1200 },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [1, 1] },
          properties: { type: "change_mask", area_ha: 400 },
        },
      ],
    });
    useAnalysisStore.getState().addFilter({
      field: "area_ha",
      op: "gt",
      value: 500,
    });
    const filtered = useAnalysisStore.getState().filteredResults();
    expect(filtered!.features).toHaveLength(1);
    expect(filtered!.features[0].properties?.area_ha).toBe(1200);
  });

  it("filteredResults returns all when no filters", () => {
    useAnalysisStore.getState().setChangeMask({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 0] },
          properties: { type: "change_mask" },
        },
      ],
    });
    const filtered = useAnalysisStore.getState().filteredResults();
    expect(filtered!.features).toHaveLength(1);
  });
});
