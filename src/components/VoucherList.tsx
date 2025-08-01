
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, Sale } from "@/lib/database";
import { useAuth } from "@/hooks/useAuth";
import VoucherEditor from "@/components/VoucherEditor";
import {
  FileText,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";

const VoucherList = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredSales(
        sales.filter(sale =>
          sale.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.items.some(item => 
            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    } else {
      setFilteredSales(sales);
    }
  }, [searchTerm, sales]);

  const loadSales = async () => {
    try {
      const allSales = await db.getSales();
      setSales(allSales);
      setFilteredSales(allSales);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const handleDelete = async (sale: Sale) => {
    if (window.confirm(`Are you sure you want to delete voucher ${sale.voucherNumber}?`)) {
      try {
        const success = await db.deleteSale(sale.id);
        if (success) {
          await loadSales();
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canEdit = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Vouchers</h1>
        <p className="text-muted-foreground">View and manage all sales transactions</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vouchers by number or product name"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vouchers ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Sale</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <code className="font-mono text-sm">{sale.voucherNumber}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.items.length} items</div>
                      <div className="text-sm text-muted-foreground">
                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)} qty
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div className="font-medium">{formatCurrency(sale.totalSale)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-green-600 font-medium">
                      +{formatCurrency(sale.totalProfit)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Completed</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSale(sale)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sale)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No vouchers match your search" : "No sales vouchers found"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voucher Editor Dialog */}
      {editingSale && (
        <VoucherEditor
          sale={editingSale}
          isOpen={!!editingSale}
          onClose={() => setEditingSale(null)}
          onUpdated={loadSales}
        />
      )}
    </div>
  );
};

export default VoucherList;
