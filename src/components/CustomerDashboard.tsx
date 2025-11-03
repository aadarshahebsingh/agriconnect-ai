import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { MapPin, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CustomerDashboard() {
  const crops = useQuery(api.crops.list, { published: true });
  const orders = useQuery(api.orders.listByCustomer);
  const createOrder = useMutation(api.orders.create);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredCrops = crops?.filter((crop) => 
    filterType === "all" || crop.type === filterType
  );

  const handleBuy = async (cropId: Id<"crops">, quantity: number, pricePerUnit: number) => {
    try {
      await createOrder({
        cropId,
        quantity,
        totalPrice: quantity * pricePerUnit,
      });
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="space-y-8">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="grains">Grains</SelectItem>
            <SelectItem value="pulses">Pulses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops?.map((crop) => (
          <motion.div
            key={crop._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden">
              <img
                src={crop.imageUrl}
                alt={crop.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{crop.name}</h3>
                  <p className="text-sm text-muted-foreground">by {crop.farmerName}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {crop.location.address}
                  </div>
                  <p>Available: {crop.quantity} {crop.unit}</p>
                  <p className="text-lg font-bold">₹{crop.pricePerUnit}/{crop.unit}</p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleBuy(crop._id, 1, crop.pricePerUnit)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Orders Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">My Orders</h2>
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-6)}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {order.quantity} | Total: ₹{order.totalPrice}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    order.status === "delivered" ? "bg-green-100 text-green-800" :
                    order.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
