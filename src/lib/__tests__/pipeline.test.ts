import { describe, it, expect } from "vitest";

// ── Filter parser (extracted for testing) ────────────────────────
// Mirror of parseFollowUpFilter in SatQueryApp.tsx
function parseFollowUpFilter(query: string) {
  const lower = query.toLowerCase();

  const gtArea = lower.match(/(?:changes?|area|size)\s*>\s*(\d+)/);
  if (gtArea) return { field: "area_ha", op: "gt", value: Number(gtArea[1]) };

  const ltArea = lower.match(/(?:changes?|area|size)\s*<\s*(\d+)/);
  if (ltArea) return { field: "area_ha", op: "lt", value: Number(ltArea[1]) };

  const gtConf = lower.match(/(?:confidence|conf)\s*\(?\s*>?\s*(\d+)/);
  if (gtConf)
    return {
      field: "confidence",
      op: "gt",
      value: Number(gtConf[1]) / 100,
    };

  return null;
}

describe("parseFollowUpFilter", () => {
  it("parses area > N", () => {
    expect(parseFollowUpFilter("Only show changes > 1 hectare")).toEqual({
      field: "area_ha",
      op: "gt",
      value: 1,
    });
  });

  it("parses area < N", () => {
    expect(parseFollowUpFilter("area < 500")).toEqual({
      field: "area_ha",
      op: "lt",
      value: 500,
    });
  });

  it("parses confidence > N", () => {
    expect(parseFollowUpFilter("Show only high confidence (>90%)")).toEqual({
      field: "confidence",
      op: "gt",
      value: 0.9,
    });
  });

  it("parses conf > N without parens", () => {
    expect(parseFollowUpFilter("confidence > 80")).toEqual({
      field: "confidence",
      op: "gt",
      value: 0.8,
    });
  });

  it("returns null for unrecognized queries", () => {
    expect(parseFollowUpFilter("Compare with 1 year ago")).toBeNull();
    expect(parseFollowUpFilter("Show deforestation in Amazon")).toBeNull();
    expect(parseFollowUpFilter("")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(parseFollowUpFilter("CHANGES > 100")).toEqual({
      field: "area_ha",
      op: "gt",
      value: 100,
    });
  });
});

// ── Store helpers ────────────────────────────────────────────────

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
  filters: Array<{ field: string; op: "gt" | "lt" | "eq"; value: number }>
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

const mockFC: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, 0] },
      properties: { type: "change_mask", area_ha: 1240, confidence: 0.92 },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [1, 1] },
      properties: { type: "change_mask", area_ha: 890, confidence: 0.87 },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [2, 2] },
      properties: { type: "highlight", label: "Hot spot" },
    },
  ],
};

describe("mergeResults", () => {
  it("merges two collections", () => {
    const a: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [mockFC.features[0]],
    };
    const b: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [mockFC.features[2]],
    };
    const result = mergeResults(a, b);
    expect(result?.features).toHaveLength(2);
  });

  it("returns null for empty inputs", () => {
    expect(mergeResults(null, null)).toBeNull();
  });

  it("handles one null input", () => {
    const result = mergeResults(mockFC, null);
    expect(result?.features).toHaveLength(3);
  });
});

describe("applyFilters", () => {
  it("returns unfiltered when no filters", () => {
    expect(applyFilters(mockFC, [])).toBe(mockFC);
  });

  it("filters by gt", () => {
    const result = applyFilters(mockFC, [
      { field: "area_ha", op: "gt", value: 1000 },
    ]);
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].properties?.area_ha).toBe(1240);
  });

  it("filters by lt", () => {
    const result = applyFilters(mockFC, [
      { field: "area_ha", op: "lt", value: 1000 },
    ]);
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].properties?.area_ha).toBe(890);
  });

  it("filters by eq", () => {
    const result = applyFilters(mockFC, [
      { field: "area_ha", op: "eq", value: 890 },
    ]);
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].properties?.area_ha).toBe(890);
  });

  it("handles missing field gracefully", () => {
    const result = applyFilters(mockFC, [
      { field: "nonexistent", op: "gt", value: 0 },
    ]);
    expect(result?.features).toHaveLength(0);
  });

  it("chains multiple filters", () => {
    const result = applyFilters(mockFC, [
      { field: "area_ha", op: "gt", value: 500 },
      { field: "confidence", op: "gt", value: 0.9 },
    ]);
    expect(result?.features).toHaveLength(1);
    expect(result?.features[0].properties?.area_ha).toBe(1240);
  });
});
