import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { db, Sale } from "@/lib/database";
import VoucherEditor from "./VoucherEditor";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Calendar,
  Printer,
  Edit,
  Trash2,
  Receipt,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

interface VoucherListProps {
  onPrintVoucher?: (sale: Sale) => void;
}

export default function VoucherList({ onPrintVoucher }: VoucherListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = sales.filter(sale =>
    sale.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = await db.getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (saleId: string) => {
    if (!window.confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) {
      return;
    }

    try {
      await db.deleteSale(saleId);
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
      });
      loadSales(); // Reload the sales list
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: "Failed to delete voucher",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = (sale: Sale) => {
    if (onPrintVoucher) {
      onPrintVoucher(sale);
    }
  };

  const handleSaleUpdated = (updatedSale: Sale) => {
    setSales(sales.map(sale => 
      sale.id === updatedSale.id ? updatedSale : sale
    ));
    setEditingSale(null);
    toast({
      title: "Success",
      description: "Voucher updated successfully",
    });
  };

  if (editingSale) {
    return (
      <VoucherEditor
        sale={editingSale}
        onSave={handleSaleUpdated}
        onCancel={() => setEditingSale(null)}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Loading vouchers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by voucher number or cashier name"
          />
        </CardContent>
      </Card>

      {/* Voucher List */}
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No vouchers found matching your search' : 'No vouchers found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Receipt className="mr-2 h-5 w-5" />
                      {sale.voucherNumber}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                      <span>Cashier: {sale.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(sale)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    {user?.role === 'admin' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSale(sale)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSale(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Items */}
                  <div className="space-y-1">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.productName} x {item.quantity}</span>
                        <span>{formatCurrency(item.totalSale)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(sale.totalSale)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Cost:</span>
                      <span>{formatCurrency(sale.totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-success">
                      <span>Profit:</span>
                      <span>+{formatCurrency(sale.totalProfit)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Received:</span>
                      <div className="font-medium">{formatCurrency(sale.receivedAmount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Change:</span>
                      <div className="font-medium">{formatCurrency(sale.changeAmount)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
