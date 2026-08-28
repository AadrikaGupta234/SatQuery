import type { BBox } from "@/stores/map-store";

/**
 * Structured result from the backend AI agent.
 * In production this comes from a Convex action that calls
 * TiTiler + change detection model.
 */
export interface AgentResult {
  boundingBox: BBox;
  beforeScene: string; // Scene ID or URL for TiTiler
  afterScene: string;
  startDate: Date;
  endDate: Date;
  changeMaskGeoJSON: GeoJSON.FeatureCollection;
  highlightsGeoJSON: GeoJSON.FeatureCollection | null;
  confidence: number; // 0-100
  explanation: string;
}

/**
 * Simulated AI agent.
 *
 * In production, replace with:
 *   const result = await ConvexActionRouter.ai.processQuery({ query });
 */
export async function processQuery(query: string): Promise<AgentResult> {
  const lower = query.toLowerCase();
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - 6);

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1200));

  if (lower.includes("deforest") || lower.includes("amazon")) {
    return {
      boundingBox: [-61, -4, -59, -2],
      beforeScene: "sentinel2_2024Q1_amazon",
      afterScene: "sentinel2_2024Q3_amazon",
      startDate,
      endDate: now,
      changeMaskGeoJSON: {
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
              type: "change_mask",
              changeType: "deforestation",
              area_ha: 1240,
              confidence: 0.92,
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
              type: "change_mask",
              changeType: "deforestation",
              area_ha: 890,
              confidence: 0.87,
            },
          },
        ],
      },
      highlightsGeoJSON: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-60.35, -3.05] },
            properties: {
              type: "highlight",
              label: "Primary clearing event",
              severity: "high",
            },
          },
        ],
      },
      confidence: 92,
      explanation:
        "Detected 2,130 ha of deforestation across the Amazon basin in the last 6 months. Primary clearing event at −60.35°, −3.05° with 92% confidence.",
    };
  }

  if (lower.includes("urban") || lower.includes("nairobi") || lower.includes("delhi")) {
    return {
      boundingBox: lower.includes("delhi")
        ? [76.8, 28.4, 77.5, 28.9]
        : [36.5, -1.6, 37.2, -0.9],
      beforeScene: lower.includes("delhi")
        ? "sentinel2_2021_delhi"
        : "sentinel2_2023_nairobi",
      afterScene: lower.includes("delhi")
        ? "sentinel2_2025_delhi"
        : "sentinel2_2025_nairobi",
      startDate: lower.includes("delhi")
        ? new Date("2021-01-01")
        : new Date("2023-01-01"),
      endDate: now,
      changeMaskGeoJSON: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: lower.includes("delhi")
                ? [
                    [
                      [77.0, 28.6],
                      [77.3, 28.6],
                      [77.3, 28.75],
                      [77.0, 28.75],
                      [77.0, 28.6],
                    ],
                  ]
                : [
                    [
                      [36.7, -1.4],
                      [37.0, -1.4],
                      [37.0, -1.1],
                      [36.7, -1.1],
                      [36.7, -1.4],
                    ],
                  ],
            },
            properties: {
              type: "change_mask",
              changeType: "urban_expansion",
              area_ha: lower.includes("delhi") ? 5800 : 3200,
              confidence: lower.includes("delhi") ? 0.91 : 0.88,
            },
          },
        ],
      },
      highlightsGeoJSON: null,
      confidence: lower.includes("delhi") ? 91 : 88,
      explanation: lower.includes("delhi")
        ? "Detected 5,800 ha of urban expansion in Delhi NCR from 2021–2025. Growth corridor along NH-48 heading south."
        : "Detected 3,200 ha of urban expansion around Nairobi since 2023. Growth corridor heading northeast.",
    };
  }

  if (lower.includes("flood") || lower.includes("mekong")) {
    return {
      boundingBox: [105.5, 9.2, 107.0, 10.5],
      beforeScene: "sentinel1_2024Q2_mekong",
      afterScene: "sentinel1_2024Q4_mekong",
      startDate,
      endDate: now,
      changeMaskGeoJSON: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [106.0, 10.0],
                  [106.5, 10.0],
                  [106.5, 9.5],
                  [106.0, 9.5],
                  [106.0, 10.0],
                ],
              ],
            },
            properties: {
              type: "change_mask",
              changeType: "flooding",
              area_ha: 8500,
              confidence: 0.95,
            },
          },
        ],
      },
      highlightsGeoJSON: null,
      confidence: 95,
      explanation:
        "Detected 8,500 ha of inundation along the Mekong Delta. Flood extent mapped with 95% confidence.",
    };
  }

  // Default
  return {
    boundingBox: [-61, -4, -59, -2],
    beforeScene: "sentinel2_2024Q1_default",
    afterScene: "sentinel2_2024Q3_default",
    startDate,
    endDate: now,
    changeMaskGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-60.5, -3.5],
                [-59.5, -3.5],
                [-59.5, -2.5],
                [-60.5, -2.5],
                [-60.5, -3.5],
              ],
            ],
          },
          properties: {
            type: "change_mask",
            changeType: "surface_change",
            area_ha: 4100,
            confidence: 0.84,
          },
        },
      ],
    },
    highlightsGeoJSON: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-60.0, -3.0] },
          properties: {
            type: "highlight",
            label: "Area of interest",
            severity: "medium",
          },
        },
      ],
    },
    confidence: 84,
    explanation:
      "General change detection complete. 4,100 ha of surface change detected.",
  };
}
