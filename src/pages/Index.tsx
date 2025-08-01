
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, TrendingUp, AlertTriangle, ShoppingCart, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}! Here's your business overview
        </p>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/sales')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Sale
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.today.totalSale)}</div>
              <p className="text-xs text-muted-foreground">{stats.today.voucherCount} transactions today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.today.totalCost)}</div>
              <p className="text-xs text-muted-foreground">Cost of goods sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.today.totalProfit)}</div>
              <p className="text-xs text-muted-foreground">Net profit today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* This Month's Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          This Month's Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth.totalSale)}</div>
              <p className="text-xs text-muted-foreground">{stats.thisMonth.voucherCount} total transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth.totalCost)}</div>
              <p className="text-xs text-muted-foreground">Total cost this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.thisMonth.totalProfit)}</div>
              <p className="text-xs text-muted-foreground">Net profit this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Daily Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.thisMonth.totalSale / new Date().getDate())}
              </div>
              <p className="text-xs text-muted-foreground">Average per day</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vouchers and Inventory Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Today's Vouchers
            </CardTitle>
            <CardDescription>Sales transactions today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.today.voucherCount}</div>
          </CardContent>
        </Card>

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
                <div className="text-2xl font-bold">{stats.inventory.total}</div>
                <div className="text-xs text-muted-foreground">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.inventory.lowStock}</div>
                <div className="text-xs text-muted-foreground">Low Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.inventory.outOfStock}</div>
                <div className="text-xs text-muted-foreground">Out of Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.inventory.lowStock > 0 || stats.inventory.outOfStock > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.inventory.lowStock > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <div className="font-medium">Low Stock Alert</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.inventory.lowStock} products need restocking
                  </div>
                </div>
                <Badge variant="secondary">Low Stock</Badge>
              </div>
            )}
            {stats.inventory.outOfStock > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div>
                  <div className="font-medium">Out of Stock</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.inventory.outOfStock} products are completely out
                  </div>
                </div>
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 text-left justify-start"
              onClick={() => navigate('/sales')}
            >
              <div>
                <ShoppingCart className="h-6 w-6 mb-2" />
                <div className="font-medium">New Sale</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 text-left justify-start"
              onClick={() => navigate('/products')}
            >
              <div>
                <Package className="h-6 w-6 mb-2" />
                <div className="font-medium">Manage Products</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 text-left justify-start"
              onClick={() => navigate('/sales')}
            >
              <div>
                <TrendingUp className="h-6 w-6 mb-2" />
                <div className="font-medium">View Sales</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
