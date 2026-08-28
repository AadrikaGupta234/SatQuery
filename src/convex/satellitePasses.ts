import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    satelliteName: v.optional(v.string()),
    groundStation: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let passes = await ctx.db.query("satellitePasses").collect();

    if (args.satelliteName) {
      passes = passes.filter((p) => p.satelliteName === args.satelliteName);
    }
    if (args.groundStation) {
      passes = passes.filter((p) => p.groundStation === args.groundStation);
    }
    if (args.status) {
      passes = passes.filter((p) => p.status === args.status);
    }

    passes.sort((a, b) => a.passTime - b.passTime);
    return passes;
  },
});

export const getUniqueSatellites = query({
  args: {},
  handler: async (ctx) => {
    const passes = await ctx.db.query("satellitePasses").collect();
    const names = [...new Set(passes.map((p) => p.satelliteName))];
    return names.sort();
  },
});

export const getUniqueStations = query({
  args: {},
  handler: async (ctx) => {
    const passes = await ctx.db.query("satellitePasses").collect();
    const stations = [...new Set(passes.map((p) => p.groundStation))];
    return stations.sort();
  },
});

export const addPass = mutation({
  args: {
    satelliteName: v.string(),
    noradId: v.string(),
    groundStation: v.string(),
    passTime: v.number(),
    durationMin: v.number(),
    maxElevation: v.number(),
    azimuth: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("satellitePasses", args);
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("satellitePasses").collect();
    if (existing.length > 0) return existing.length;

    const satellites = [
      { name: "ISS (ZARYA)", noradId: "25544" },
      { name: "HUBBLE", noradId: "20580" },
      { name: "LANDSAT 9", noradId: "49260" },
      { name: "STARLINK-1130", noradId: "44713" },
      { name: "GPS IIF-12", noradId: "41328" },
      { name: "COSMOS 2558", noradId: "53320" },
    ];

    const stations = [
      "Poker Flat, AK",
      "Svalbard, NO",
      "Fairbanks, AK",
      "Santiago, CL",
    ];

    const now = Date.now();
    const DAY = 86400000;

    const statuses: Array<"scheduled" | "completed" | "missed"> = [
      "scheduled",
      "completed",
      "missed",
    ];
    const priorities: Array<"high" | "medium" | "low"> = [
      "high",
      "medium",
      "low",
    ];

    const count = 24;
    for (let i = 0; i < count; i++) {
      const sat = satellites[i % satellites.length];
      const station = stations[i % stations.length];
      const dayOffset = Math.floor(i / 4) - 2;
      const hourOffset = (i * 3) % 24;
      const passTime = now + dayOffset * DAY + hourOffset * 3600000;
      const status =
        dayOffset < 0
          ? statuses[Math.floor(Math.random() * 2)]
          : statuses[0];
      const priority = priorities[Math.floor(Math.random() * 3)];

      await ctx.db.insert("satellitePasses", {
        satelliteName: sat.name,
        noradId: sat.noradId,
        groundStation: station,
        passTime,
        durationMin: Math.floor(Math.random() * 12) + 3,
        maxElevation: Math.floor(Math.random() * 70) + 15,
        azimuth: `${Math.floor(Math.random() * 360)}°`,
        status,
        priority,
      });
    }

    return count;
  },
});
