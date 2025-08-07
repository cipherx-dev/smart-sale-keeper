import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { db, Product, Sale, SaleItem } from "@/lib/database";
import VoucherList from "@/components/VoucherList";
import CategoryManager from "@/components/CategoryManager";
import { printReceiptDialog } from "@/components/PrintReceipt";
import {
  Plus,
  Minus,
  ShoppingCart,
  Scan,
  Search,
  Trash2,
  Receipt,
  Calculator,
  DollarSign,
  FileText,
  Tag
} from "lucide-react";

const saleSchema = z.object({
  barcode: z.string(),
  receivedAmount: z.number().min(0, "Received amount must be positive"),
});

type SaleForm = z.infer<typeof saleSchema>;

interface CartItem extends SaleItem {
  quantity: number;
}

export default function SalesModule() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductList, setShowProductList] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      barcode: "",
      receivedAmount: 0,
    },
  });

  const receivedAmount = watch("receivedAmount");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await db.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredProducts(
        products.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.includes(searchTerm)
        )
      );
      setShowProductList(true);
    } else {
      setFilteredProducts([]);
      setShowProductList(false);
    }
  }, [searchTerm, products]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.quantity < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} items available`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.quantity} items available`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
              totalCost: item.costPrice * (item.quantity + quantity),
              totalSale: item.salePrice * (item.quantity + quantity),
              profit: (item.salePrice - item.costPrice) * (item.quantity + quantity),
            }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        totalCost: product.costPrice * quantity,
        totalSale: product.salePrice * quantity,
        profit: (product.salePrice - product.costPrice) * quantity,
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm("");
    setShowProductList(false);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} items available`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? {
            ...item,
            quantity: newQuantity,
            totalCost: item.costPrice * newQuantity,
            totalSale: item.salePrice * newQuantity,
            profit: (item.salePrice - item.costPrice) * newQuantity,
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totals = cart.reduce(
    (acc, item) => ({
      totalCost: acc.totalCost + item.totalCost,
      totalSale: acc.totalSale + item.totalSale,
      totalProfit: acc.totalProfit + item.profit,
    }),
    { totalCost: 0, totalSale: 0, totalProfit: 0 }
  );

  const changeAmount = receivedAmount - totals.totalSale;

  const handleBarcodeSearch = async (data: SaleForm) => {
    try {
      const product = await db.findProductByBarcode(data.barcode);
      if (product) {
        addToCart(product);
        setValue("barcode", "");
      } else {
        toast({
          title: "Product Not Found",
          description: "No product found with this barcode",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching product:', error);
    }
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before completing sale",
        variant: "destructive",
      });
      return;
    }

    if (receivedAmount < totals.totalSale) {
      toast({
        title: "Insufficient Payment",
        description: "Received amount is less than total sale",
        variant: "destructive",
      });
      return;
    }

    try {
      const sale: Omit<Sale, 'id' | 'voucherNumber' | 'createdAt'> = {
        items: cart,
        totalCost: totals.totalCost,
        totalSale: totals.totalSale,
        totalProfit: totals.totalProfit,
        receivedAmount,
        changeAmount,
        createdBy: "pos-user",
      };

      const savedSale = await db.saveSale(sale);
      
      toast({
        title: "Sale Completed",
        description: `Voucher ${savedSale.voucherNumber} created successfully`,
      });

      // Ask if user wants to print
      printReceiptDialog(savedSale);

      // Reset form and cart
      setCart([]);
      reset();
      
      // Refresh products to show updated quantities
      const updatedProducts = await db.getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error completing sale:', error);
      toast({
        title: "Error",
        description: "Failed to complete sale",
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

  const handlePrintVoucher = (sale: Sale) => {
    printReceiptDialog(sale);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-muted-foreground">Manage sales, vouchers, and categories</p>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Terminal</TabsTrigger>
          <TabsTrigger value="vouchers">Voucher List</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Product Search & Cart */}
            <div className="space-y-4">
              {/* Barcode Scanner */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="mr-2 h-5 w-5" />
                    Barcode Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleBarcodeSearch)} className="flex gap-2">
                    <Input
                      {...register("barcode")}
                      placeholder="Scan or enter barcode"
                      className="flex-1"
                    />
                    <Button type="submit">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Product Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Search Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or barcode"
                  />
                  
                  {showProductList && filteredProducts.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                          onClick={() => addToCart(product)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(product.salePrice)} • Stock: {product.quantity}
                              </p>
                            </div>
                            <Badge variant={product.quantity > 0 ? "secondary" : "destructive"}>
                              {product.quantity > 0 ? "In Stock" : "Out"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shopping Cart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Shopping Cart ({cart.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Cart is empty. Add products to start a sale.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.salePrice)} each
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center">{item.quantity}</span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="font-medium">{formatCurrency(item.totalSale)}</p>
                            <p className="text-xs text-success">+{formatCurrency(item.profit)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Order Summary & Payment */}
            <div className="space-y-4">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(totals.totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sale:</span>
                    <span className="font-medium">{formatCurrency(totals.totalSale)}</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Total Profit:</span>
                    <span className="font-medium">+{formatCurrency(totals.totalProfit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-primary">{formatCurrency(totals.totalSale)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="receivedAmount">Received Amount</Label>
                    <Input
                      id="receivedAmount"
                      type="number"
                      {...register("receivedAmount", { valueAsNumber: true })}
                      placeholder="Enter received amount"
                    />
                    {errors.receivedAmount && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.receivedAmount.message}
                      </p>
                    )}
                  </div>

                  {receivedAmount > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between">
                        <span>Change Amount:</span>
                        <span className={`font-medium ${changeAmount >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(Math.abs(changeAmount))}
                          {changeAmount < 0 && " (Insufficient)"}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={completeSale}
                    disabled={cart.length === 0 || receivedAmount < totals.totalSale}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Complete Sale
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherList onPrintVoucher={handlePrintVoucher} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
