import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/database";
import {
  Download,
  Upload,
  Database,
  Shield,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function Backup() {
  const { toast } = useToast();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Get all data from database
      const products = db.getProducts();
      const sales = db.getSales();
      const users = db.getUsers();

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          products,
          sales,
          users
        },
        metadata: {
          totalProducts: products.length,
          totalSales: sales.length,
          totalUsers: users.length,
          dateRange: {
            oldestSale: sales.length > 0 ? sales[0].createdAt : null,
            newestSale: sales.length > 0 ? sales[sales.length - 1].createdAt : null
          }
        }
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Created",
        description: "Your data has been successfully backed up and downloaded",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.data || !backupData.data.products || !backupData.data.sales || !backupData.data.users) {
        throw new Error("Invalid backup file format");
      }

      // Confirm restore
      const confirmed = window.confirm(
        `This will replace all current data with backup from ${new Date(backupData.timestamp).toLocaleString()}. Are you sure?`
      );

      if (!confirmed) {
        setIsRestoring(false);
        return;
      }

      // Restore data
      localStorage.setItem('pos_products', JSON.stringify(backupData.data.products));
      localStorage.setItem('pos_sales', JSON.stringify(backupData.data.sales));
      localStorage.setItem('pos_users', JSON.stringify(backupData.data.users));

      toast({
        title: "Restore Completed",
        description: "Your data has been successfully restored from backup",
      });

      // Refresh the page to reload data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore from backup. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const clearAllData = () => {
    const confirmed = window.confirm(
      "This will permanently delete ALL data including products, sales, and users. This action cannot be undone. Are you sure?"
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        "Are you absolutely sure? This will delete everything!"
      );

      if (doubleConfirm) {
        localStorage.removeItem('pos_products');
        localStorage.removeItem('pos_sales');
        localStorage.removeItem('pos_users');

        toast({
          title: "Data Cleared",
          description: "All data has been permanently deleted",
        });

        // Refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  // Calculate current data stats
  const stats = {
    products: db.getProducts().length,
    sales: db.getSales().length,
    users: db.getUsers().length,
    dataSize: JSON.stringify({
      products: db.getProducts(),
      sales: db.getSales(),
      users: db.getUsers()
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="text-muted-foreground">Manage your data backups and system restore</p>
      </div>

      {/* Data Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{stats.products}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales Records</p>
                <p className="text-2xl font-bold">{stats.sales}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Accounts</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Size</p>
                <p className="text-2xl font-bold">{(stats.dataSize / 1024).toFixed(1)}KB</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Create a complete backup of your POS system data including:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>All product information and inventory</li>
                <li>Complete sales transaction history</li>
                <li>User accounts and permissions</li>
              </ul>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Safe & Secure</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your data is exported as a JSON file that can be safely stored locally or on cloud storage.
              </p>
            </div>

            <Button 
              onClick={createBackup} 
              disabled={isCreatingBackup}
              className="w-full"
            >
              {isCreatingBackup ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Create & Download Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Restore from Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Restore your system from a previously created backup file.
              </p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warning</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This will replace ALL current data. Make sure to backup current data first.
              </p>
            </div>

            <div>
              <Label htmlFor="backup-file">Select Backup File</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                disabled={isRestoring}
                className="mt-1"
              />
            </div>

            {isRestoring && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Restoring data...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-destructive mb-2">Clear All Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all products, sales, and user data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={clearAllData}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Regular Backups</h4>
              <p className="text-sm text-muted-foreground">
                Create backups regularly, especially before major changes or at the end of each business day.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multiple Storage</h4>
              <p className="text-sm text-muted-foreground">
                Store backup files in multiple locations - local storage, cloud storage, or external drives.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Test Restores</h4>
              <p className="text-sm text-muted-foreground">
                Periodically test your backups by restoring them to ensure they work correctly.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Security</h4>
              <p className="text-sm text-muted-foreground">
                Keep backup files secure and consider encrypting sensitive business data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}