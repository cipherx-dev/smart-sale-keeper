import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Printer, Edit, Eye, Search } from "lucide-react";

export default function Sales() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Module</h1>
          <p className="text-muted-foreground">
            Manage sales transactions and vouchers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-primary/10 rounded-lg mr-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Add New Sale</h3>
              <p className="text-sm text-muted-foreground">Create voucher</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-secondary/10 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Voucher List</h3>
              <p className="text-sm text-muted-foreground">View all vouchers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-success/10 rounded-lg mr-4">
              <Printer className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Print Voucher</h3>
              <p className="text-sm text-muted-foreground">Print receipts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="flex items-center p-6">
            <div className="p-2 bg-warning/10 rounded-lg mr-4">
              <Search className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Search Vouchers</h3>
              <p className="text-sm text-muted-foreground">Find transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Module Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-lg font-medium mb-4">Full Sales Module Coming Next!</div>
            <div className="grid gap-2 text-sm text-muted-foreground max-w-2xl mx-auto">
              <div className="flex items-center justify-between py-1">
                <span>✅ Add Product by Barcode or Search</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Auto calculate total price + change</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Voucher Number auto generate</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Save to database (local-first)</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Show Profit per voucher</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>✅ Print voucher (A5/A6 format)</span>
                <Badge variant="secondary">Coming Next</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}