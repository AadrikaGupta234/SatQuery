import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),

    satellitePasses: defineTable({
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
    })
      .index("by_passTime", ["passTime"])
      .index("by_status", ["status"])
      .index("by_satellite", ["satelliteName"]),
  },
  { schemaValidation: false }
);

export default schema;
