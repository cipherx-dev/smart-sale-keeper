import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Users,
  ShoppingCart,
  Plus
} from "lucide-react";
import { db } from "@/lib/database";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

// Chart data for sales trend
const generateChartData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Simulate sales data
    const sales = Math.floor(Math.random() * 500000) + 200000;
    data.push({
      name: dayName,
      sales: sales,
      profit: Math.floor(sales * 0.3),
    });
  }
  
  return data;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    todaySales: { totalSale: 0, totalCost: 0, totalProfit: 0, voucherCount: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0 }
  });
  const [chartData] = useState(generateChartData());

  useEffect(() => {
    // Initialize database with sample data
    db.initializeDatabase();
    
    // Load real data
    const todaySales = db.getTodaysSales();
    const inventory = db.getInventoryStats();
    
    setDashboardData({
      todaySales,
      inventory
    });
  }, []);

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/sales')}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Sale
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
              {formatCurrency(dashboardData.todaySales.totalSale)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.todaySales.voucherCount} transactions today
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
              Net profit today
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
              <Badge variant="secondary">{dashboardData.inventory.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock</span>
              <Badge variant="outline" className="text-warning border-warning">
                {dashboardData.inventory.lowStock}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Out of Stock</span>
              <Badge variant="destructive">
                {dashboardData.inventory.outOfStock}
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
            {dashboardData.inventory.lowStock > 0 && (
              <div className="p-3 bg-warning-light rounded-lg">
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.inventory.lowStock} products need restocking
                </p>
              </div>
            )}
            {dashboardData.inventory.outOfStock > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium">Out of Stock</p>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.inventory.outOfStock} products are completely out
                </p>
              </div>
            )}
            {dashboardData.inventory.lowStock === 0 && dashboardData.inventory.outOfStock === 0 && (
              <div className="p-3 bg-success-light rounded-lg">
                <p className="text-sm font-medium">All Good!</p>
                <p className="text-xs text-muted-foreground">
                  No stock issues detected
                </p>
              </div>
            )}
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
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => navigate('/sales')}
            >
              <Receipt className="mr-2 h-4 w-4" />
              New Sale
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => navigate('/products')}
            >
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => navigate('/backup')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'sales' ? 'Sales' : 'Profit'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--success))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}