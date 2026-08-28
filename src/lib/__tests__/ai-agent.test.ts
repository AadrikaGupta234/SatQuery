import { describe, it, expect } from "vitest";
import { processQuery } from "../ai-agent";

describe("processQuery", () => {
  it("returns a valid AgentResult for deforestation query", async () => {
    const result = await processQuery(
      "Show deforestation in Amazon basin last 6 months"
    );
    expect(result.boundingBox).toHaveLength(4);
    expect(result.changeMaskGeoJSON.type).toBe("FeatureCollection");
    expect(result.changeMaskGeoJSON.features.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(80);
    expect(result.explanation).toContain("deforestation");
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("returns highlights for deforestation query", async () => {
    const result = await processQuery("deforestation in amazon");
    expect(result.highlightsGeoJSON).not.toBeNull();
    expect(result.highlightsGeoJSON!.features.length).toBeGreaterThan(0);
  });

  it("handles urban/delhi query", async () => {
    const result = await processQuery(
      "Show urban expansion in Delhi 2021-2025"
    );
    expect(result.explanation).toContain("Delhi");
    expect(result.boundingBox[0]).toBeCloseTo(76.8, 0);
  });

  it("handles nairobi query", async () => {
    const result = await processQuery("urban sprawl nairobi");
    expect(result.explanation).toContain("Nairobi");
  });

  it("handles flood query", async () => {
    const result = await processQuery("flood damage along Mekong Delta");
    expect(result.explanation).toContain("Mekong");
    expect(result.confidence).toBe(95);
  });

  it("returns default for unrecognized query", async () => {
    const result = await processQuery("compare crop health in Punjab");
    expect(result.changeMaskGeoJSON.features).toHaveLength(1);
    expect(result.highlightsGeoJSON).not.toBeNull();
    expect(result.explanation).toContain("surface change");
  });

  it("each feature has type property in properties", async () => {
    const result = await processQuery("deforestation amazon");
    for (const f of result.changeMaskGeoJSON.features) {
      expect(f.properties?.type).toBe("change_mask");
    }
    if (result.highlightsGeoJSON) {
      for (const f of result.highlightsGeoJSON.features) {
        expect(f.properties?.type).toBe("highlight");
      }
    }
  });
});
