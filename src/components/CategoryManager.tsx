import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { db, Product } from "@/lib/database";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

export function CategoryManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allProducts = db.getProducts();
    setProducts(allProducts);
    setCategories(db.getCategories());
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Invalid Category",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Category Exists",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }

    // Create a sample product with this category to establish it
    const sampleProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `Sample ${newCategory}`,
      barcode: `SAMPLE${Date.now()}`,
      costPrice: 0,
      salePrice: 0,
      quantity: 0,
      category: newCategory.trim(),
    };

    db.saveProduct(sampleProduct);
    
    toast({
      title: "Category Added",
      description: `Category "${newCategory}" has been created`,
    });

    setNewCategory("");
    loadData();
  };

  const editCategory = (oldCategory: string) => {
    setEditingCategory(oldCategory);
    setEditCategoryName(oldCategory);
    setShowDialog(true);
  };

  const saveEditCategory = () => {
    if (!editCategoryName.trim() || !editingCategory) return;

    if (editCategoryName === editingCategory) {
      setShowDialog(false);
      return;
    }

    // Update all products with this category
    const productsToUpdate = products.filter(p => p.category === editingCategory);
    
    productsToUpdate.forEach(product => {
      db.updateProduct(product.id, { category: editCategoryName.trim() });
    });

    toast({
      title: "Category Updated",
      description: `Category "${editingCategory}" renamed to "${editCategoryName}"`,
    });

    setShowDialog(false);
    setEditingCategory(null);
    loadData();
  };

  const deleteCategory = (category: string) => {
    const productsInCategory = products.filter(p => p.category === category);
    
    if (productsInCategory.length > 0) {
      const confirmDelete = window.confirm(
        `This category has ${productsInCategory.length} products. All products in this category will be moved to "Uncategorized". Continue?`
      );
      
      if (!confirmDelete) return;

      // Move products to "Uncategorized"
      productsInCategory.forEach(product => {
        db.updateProduct(product.id, { category: "Uncategorized" });
      });
    }

    toast({
      title: "Category Deleted",
      description: `Category "${category}" has been deleted`,
    });

    loadData();
  };

  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Category */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newCategory">Add New Category</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Categories ({categories.length})</h3>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {getCategoryProductCount(category)} products
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCategory(category)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No categories found. Add your first category above.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCategory">Category Name</Label>
              <Input
                id="editCategory"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter new category name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEditCategory}>Save Changes</Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}