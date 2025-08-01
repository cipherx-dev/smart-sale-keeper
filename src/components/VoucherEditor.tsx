import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { db, Sale, SaleItem, Product } from '@/lib/database';
import { Edit, Save, Plus, Minus, Trash2 } from 'lucide-react';

interface VoucherEditorProps {
  sale: Sale;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const VoucherEditor: React.FC<VoucherEditorProps> = ({
  sale,
  isOpen,
  onClose,
  onUpdated
}) => {
  const { toast } = useToast();
  const [editedItems, setEditedItems] = useState<SaleItem[]>(sale.items);
  const [products, setProducts] = useState<Product[]>([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    setEditedItems(sale.items);
    loadProducts();
  }, [sale]);

  const loadProducts = async () => {
    try {
      const allProducts = await db.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = [...editedItems];
    const item = updatedItems[index];
    const quantityDiff = newQuantity - item.quantity;
    
    item.quantity = newQuantity;
    item.totalCost = item.costPrice * newQuantity;
    item.totalSale = item.salePrice * newQuantity;
    item.profit = item.totalSale - item.totalCost;
    
    setEditedItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(updatedItems);
  };

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = editedItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      updateItemQuantity(existingItemIndex, editedItems[existingItemIndex].quantity + 1);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        totalCost: product.costPrice,
        totalSale: product.salePrice,
        profit: product.salePrice - product.costPrice,
      };
      setEditedItems([...editedItems, newItem]);
    }
  };

  const calculateTotals = () => {
    const totalCost = editedItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalSale = editedItems.reduce((sum, item) => sum + item.totalSale, 0);
    const totalProfit = totalSale - totalCost;
    
    return { totalCost, totalSale, totalProfit };
  };

  const handleSave = async () => {
    try {
      const totals = calculateTotals();
      
      const updatedSale: Partial<Sale> = {
        items: editedItems,
        totalCost: totals.totalCost,
        totalSale: totals.totalSale,
        totalProfit: totals.totalProfit,
        // Keep original payment amounts
        receivedAmount: sale.receivedAmount,
        changeAmount: sale.changeAmount,
      };

      await db.updateSale(sale.id, updatedSale);
      
      toast({
        title: "Voucher Updated",
        description: "Sale voucher has been updated successfully",
      });
      
      onUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update voucher",
        variant: "destructive",
      });
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Voucher #{sale.voucherNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {products.map(product => (
                  <Button
                    key={product.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addProduct(product.id)}
                    className="text-left justify-start h-auto p-2"
                  >
                    <div className="truncate">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        MMK {product.salePrice.toLocaleString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sale Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>MMK {item.salePrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>MMK {item.totalSale.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {editedItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items in this sale. Add products above.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-lg font-bold">MMK {totals.totalCost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Sale</div>
                  <div className="text-lg font-bold">MMK {totals.totalSale.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Profit</div>
                  <div className="text-lg font-bold text-green-600">
                    MMK {totals.totalProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherEditor;
