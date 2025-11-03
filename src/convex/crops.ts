import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    imageUrl: v.string(),
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
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const cropId = await ctx.db.insert("crops", {
      ...args,
      farmerId: user._id,
      farmerName: user.name || "Anonymous Farmer",
      views: 0,
      sales: 0,
    });

    return cropId;
  },
});

export const list = query({
  args: {
    published: v.optional(v.boolean()),
    farmerId: v.optional(v.id("users")),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cropsQuery = ctx.db.query("crops");

    const crops = await cropsQuery.collect();

    return crops.filter((crop) => {
      if (args.published !== undefined && crop.published !== args.published) {
        return false;
      }
      if (args.farmerId && crop.farmerId !== args.farmerId) {
        return false;
      }
      if (args.type && crop.type !== args.type) {
        return false;
      }
      return true;
    });
  },
});

export const getById = query({
  args: { id: v.id("crops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("crops"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.string(),
    })),
    harvestDate: v.optional(v.string()),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    pricePerUnit: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const crop = await ctx.db.get(args.id);
    if (!crop) {
      throw new Error("Crop not found");
    }

    if (crop.farmerId !== user._id) {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("crops") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const crop = await ctx.db.get(args.id);
    if (!crop) {
      throw new Error("Crop not found");
    }

    if (crop.farmerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const incrementViews = mutation({
  args: { id: v.id("crops") },
  handler: async (ctx, args) => {
    const crop = await ctx.db.get(args.id);
    if (!crop) {
      throw new Error("Crop not found");
    }

    await ctx.db.patch(args.id, {
      views: (crop.views || 0) + 1,
    });
  },
});
