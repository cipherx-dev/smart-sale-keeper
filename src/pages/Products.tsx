import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit, Trash2, Upload, Download, Printer, Barcode } from "lucide-react";

export default function Products() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory and product catalog
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-primary/10 rounded-lg mr-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">List Products</h3>
              <p className="text-sm text-muted-foreground">View all items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-success/10 rounded-lg mr-4">
              <Upload className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Import Excel</h3>
              <p className="text-sm text-muted-foreground">Bulk import</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-warning/10 rounded-lg mr-4">
              <Download className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Export Excel</h3>
              <p className="text-sm text-muted-foreground">Download data</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-secondary/10 rounded-lg mr-4">
              <Barcode className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Print Barcodes</h3>
              <p className="text-sm text-muted-foreground">Generate labels</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle>Product Module Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-4">Complete Product Management System</div>
            <div className="grid gap-2 text-sm text-muted-foreground max-w-2xl mx-auto">
              <div className="flex items-center justify-between py-1">
                <span>✅ Add/Edit/Delete products</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Cost Price, Sale Price management</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Auto detect Out of Stock (Qty = 0)</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Low stock warning (Qty &lt; 5)</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Generate or scan barcode</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Excel import/export</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Print barcode (Avery format)</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}