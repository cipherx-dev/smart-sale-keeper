import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Package,
  AlertTriangle,
  Calendar,
  BarChart3,
  Users
} from "lucide-react";

// Mock data - in real app this would come from database
const dashboardData = {
  todaySales: {
    totalAmount: 1250000,
    totalCost: 850000,
    totalProfit: 400000,
    voucherCount: 45
  },
  products: {
    total: 120,
    lowStock: 8,
    outOfStock: 3
  }
};

export function Dashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Today's business overview and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(dashboardData.todaySales.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.todaySales.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost of goods sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(dashboardData.todaySales.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.todaySales.voucherCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales transactions today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats and Alerts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Products</span>
              <Badge variant="secondary">{dashboardData.products.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock</span>
              <Badge variant="outline" className="text-warning border-warning">
                {dashboardData.products.lowStock}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Out of Stock</span>
              <Badge variant="destructive">
                {dashboardData.products.outOfStock}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-warning-light rounded-lg">
              <p className="text-sm font-medium">Low Stock Alert</p>
              <p className="text-xs text-muted-foreground">
                8 products need restocking
              </p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium">Out of Stock</p>
              <p className="text-xs text-muted-foreground">
                3 products are completely out
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm">
              <Receipt className="mr-2 h-4 w-4" />
              New Sale
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Sales chart will be implemented next</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}