import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, TrendingUp, AlertTriangle, ShoppingCart, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6 -mt-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Today's business overview and key metrics</p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Sale Button */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Sale
              </Button>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">MMK 101,100</div>
              <p className="text-xs text-muted-foreground">2 transactions today</p>
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">MMK 80,700</div>
              <p className="text-xs text-muted-foreground">Cost of goods sold</p>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">MMK 20,400</div>
              <p className="text-xs text-muted-foreground">Net profit today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vouchers and Inventory Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Vouchers
            </CardTitle>
            <CardDescription>Sales transactions today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-xs text-muted-foreground">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">2</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div>
              <div className="font-medium">Low Stock Alert</div>
              <div className="text-sm text-muted-foreground">2 products need restocking</div>
            </div>
            <Badge variant="secondary">Low Stock</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <div className="font-medium">Out of Stock</div>
              <div className="text-sm text-muted-foreground">2 products are completely out</div>
            </div>
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 text-left justify-start">
              <div>
                <ShoppingCart className="h-6 w-6 mb-2" />
                <div className="font-medium">New Sale</div>
              </div>
            </Button>
            <Button variant="outline" className="h-20 text-left justify-start">
              <div>
                <Package className="h-6 w-6 mb-2" />
                <div className="font-medium">Add Product</div>
              </div>
            </Button>
            <Button variant="outline" className="h-20 text-left justify-start">
              <div>
                <TrendingUp className="h-6 w-6 mb-2" />
                <div className="font-medium">View Reports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
