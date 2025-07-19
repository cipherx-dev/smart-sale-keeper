import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { db, Sale } from "@/lib/database";
import { Edit, Trash2, Receipt, Eye, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

interface VoucherListProps {
  onEditVoucher?: (sale: Sale) => void;
  onPrintVoucher?: (sale: Sale) => void;
}

export function VoucherList({ onEditVoucher, onPrintVoucher }: VoucherListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [searchVoucher, setSearchVoucher] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchVoucher, searchDate]);

  const loadSales = async () => {
    try {
      const allSales = await db.getSales();
      const sortedSales = allSales.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSales(sortedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const filterSales = () => {
    let filtered = sales;

    if (searchVoucher) {
      filtered = filtered.filter(sale => 
        sale.voucherNumber.toLowerCase().includes(searchVoucher.toLowerCase())
      );
    }

    if (searchDate) {
      filtered = filtered.filter(sale => {
        const saleDate = format(new Date(sale.createdAt), 'yyyy-MM-dd');
        return saleDate === searchDate;
      });
    }

    setFilteredSales(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setEditAmount(sale.receivedAmount);
    setEditDialog(true);
  };

  const saveEditedSale = async () => {
    if (!selectedSale) return;

    try {
      const updatedSale = await db.updateSale(selectedSale.id, {
        receivedAmount: editAmount,
        changeAmount: editAmount - selectedSale.totalSale
      });

      if (updatedSale) {
        toast({
          title: "Voucher Updated",
          description: `Voucher ${selectedSale.voucherNumber} has been updated`,
        });
        await loadSales();
        setEditDialog(false);
        onEditVoucher?.(updatedSale);
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Error",
        description: "Failed to update voucher",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (window.confirm(`Are you sure you want to delete voucher ${sale.voucherNumber}?`)) {
      try {
        const success = await db.deleteSale(sale.id);
        if (success) {
          toast({
            title: "Voucher Deleted",
            description: `Voucher ${sale.voucherNumber} has been deleted and stock restored`,
          });
          await loadSales();
        }
      } catch (error) {
        console.error('Error deleting sale:', error);
        toast({
          title: "Error",
          description: "Failed to delete voucher",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setViewDialog(true);
  };

  const handlePrint = (sale: Sale) => {
    onPrintVoucher?.(sale);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Sales Vouchers ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="searchVoucher">Search by Voucher Number</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchVoucher"
                  placeholder="Enter voucher number..."
                  value={searchVoucher}
                  onChange={(e) => setSearchVoucher(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchDate">Search by Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchDate"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Sale</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Badge variant="outline">{sale.voucherNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{sale.items.length} items</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(sale.totalSale)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    +{formatCurrency(sale.totalProfit)}
                  </TableCell>
                  <TableCell>{sale.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSale(sale)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(sale)}
                      >
                        <Receipt className="h-3 w-3" />
                      </Button>
                      {user?.role === 'admin' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSale(sale)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Voucher {selectedSale?.voucherNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editAmount">Received Amount</Label>
              <Input
                id="editAmount"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Sale:</span>
              <span>{formatCurrency(selectedSale?.totalSale || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Change:</span>
              <span>{formatCurrency(editAmount - (selectedSale?.totalSale || 0))}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEditedSale}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Voucher Details - {selectedSale?.voucherNumber}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Date:</strong> {format(new Date(selectedSale.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
                <div>
                  <strong>Cashier:</strong> {selectedSale.createdBy}
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.salePrice)}</TableCell>
                      <TableCell>{formatCurrency(item.totalSale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Total Sale:</span>
                  <span className="font-medium">{formatCurrency(selectedSale.totalSale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Received:</span>
                  <span>{formatCurrency(selectedSale.receivedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>{formatCurrency(selectedSale.changeAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Profit:</span>
                  <span>+{formatCurrency(selectedSale.totalProfit)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}