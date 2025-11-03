import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, LogOut, Package, ShoppingCart, Sprout } from "lucide-react";
import { useNavigate } from "react-router";
import { FarmerDashboard } from "@/components/FarmerDashboard";
import { CustomerDashboard } from "@/components/CustomerDashboard";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.svg" alt="AgriConnect" className="h-10 w-10" />
            <h1 className="text-2xl font-bold tracking-tight">AgriConnect AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email || "User"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="farmer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="farmer" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              Farmer
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Customer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="farmer">
            <FarmerDashboard />
          </TabsContent>

          <TabsContent value="customer">
            <CustomerDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
