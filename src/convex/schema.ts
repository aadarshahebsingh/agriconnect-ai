import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    crops: defineTable({
      name: v.string(),
      type: v.string(),
      imageUrl: v.string(),
      farmerId: v.id("users"),
      farmerName: v.string(),
      location: v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.string(),
      }),
      harvestDate: v.string(),
      quantity: v.number(),
      unit: v.string(),
      pricePerUnit: v.number(),
      diseaseStatus: v.optional(v.object({
        detected: v.boolean(),
        name: v.optional(v.string()),
        confidence: v.optional(v.number()),
        suggestion: v.optional(v.string()),
      })),
      published: v.boolean(),
      views: v.number(),
      sales: v.number(),
    }),

    orders: defineTable({
      cropId: v.id("crops"),
      customerId: v.id("users"),
      customerName: v.string(),
      farmerId: v.id("users"),
      quantity: v.number(),
      totalPrice: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("delivered"),
        v.literal("cancelled")
      ),
    }),
  },
  {
    schemaValidation: false,
  },
);

export default schema;