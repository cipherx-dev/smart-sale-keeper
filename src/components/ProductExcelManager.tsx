
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { db, Product } from '@/lib/database';

interface ProductExcelManagerProps {
  products: Product[];
  onProductsUpdated: () => void;
}

const ProductExcelManager: React.FC<ProductExcelManagerProps> = ({ 
  products, 
  onProductsUpdated 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Barcode', 'Cost Price', 'Sale Price', 'Quantity', 'Category'];
      const csvContent = [
        headers.join(','),
        ...products.map(product => [
          `"${product.name}"`,
          `"${product.barcode}"`,
          product.costPrice,
          product.salePrice,
          product.quantity,
          `"${product.category}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Products exported to CSV file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products",
        variant: "destructive",
      });
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Skip header row
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      let importedCount = 0;
      for (const line of dataLines) {
        const values = line.split(',').map(val => val.replace(/"/g, '').trim());
        
        if (values.length >= 6) {
          const productData = {
            name: values[0],
            barcode: values[1] || Date.now().toString(),
            costPrice: parseFloat(values[2]) || 0,
            salePrice: parseFloat(values[3]) || 0,
            quantity: parseInt(values[4]) || 0,
            category: values[5] || 'General',
          };

          // Check if product already exists
          const existingProduct = await db.findProductByBarcode(productData.barcode);
          if (!existingProduct) {
            await db.saveProduct(productData);
            importedCount++;
          }
        }
      }

      toast({
        title: "Import Successful",
        description: `${importedCount} products imported successfully`,
      });
      
      onProductsUpdated();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import products from file",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportExcel}
      >
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleImportExcel}
        className="hidden"
      />
    </div>
  );
};

export default ProductExcelManager;
