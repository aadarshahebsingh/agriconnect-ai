import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    cropId: v.id("crops"),
    quantity: v.number(),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const crop = await ctx.db.get(args.cropId);
    if (!crop) {
      throw new Error("Crop not found");
    }

    const orderId = await ctx.db.insert("orders", {
      cropId: args.cropId,
      customerId: user._id,
      customerName: user.name || "Anonymous Customer",
      farmerId: crop.farmerId,
      quantity: args.quantity,
      totalPrice: args.totalPrice,
      status: "pending",
    });

    // Update crop sales count
    await ctx.db.patch(args.cropId, {
      sales: (crop.sales || 0) + 1,
    });

    return orderId;
  },
});

export const listByCustomer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .collect();

    return orders.filter((order) => order.customerId === user._id);
  },
});

export const listByFarmer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const orders = await ctx.db
      .query("orders")
      .collect();

    return orders.filter((order) => order.farmerId === user._id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.farmerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});
