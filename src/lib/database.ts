// Local database using localStorage for POS system
export interface Product {
  id: string;
  name: string;
  barcode: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  totalCost: number;
  totalSale: number;
  profit: number;
}

export interface Sale {
  id: string;
  voucherNumber: string;
  items: SaleItem[];
  totalCost: number;
  totalSale: number;
  totalProfit: number;
  receivedAmount: number;
  changeAmount: number;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

class LocalDatabase {
  private getStorageKey(table: string): string {
    return `pos_${table}`;
  }

  // Generic methods
  private save<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
  }

  private load<T>(table: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(table));
    return data ? JSON.parse(data) : [];
  }

  // Product methods
  getProducts(): Product[] {
    return this.load<Product>('products');
  }

  saveProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.save('products', products);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save('products', products);
    return products[index];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    this.save('products', filtered);
    return true;
  }

  findProductByBarcode(barcode: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.barcode === barcode) || null;
  }

  // Sale methods
  getSales(): Sale[] {
    return this.load<Sale>('sales');
  }

  saveSale(sale: Omit<Sale, 'id' | 'voucherNumber' | 'createdAt'>): Sale {
    const sales = this.getSales();
    const voucherNumber = this.generateVoucherNumber();
    
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      voucherNumber,
      createdAt: new Date().toISOString(),
    };
    
    sales.push(newSale);
    this.save('sales', sales);
    
    // Update product quantities
    newSale.items.forEach(item => {
      const product = this.getProducts().find(p => p.id === item.productId);
      if (product) {
        this.updateProduct(product.id, {
          quantity: product.quantity - item.quantity
        });
      }
    });
    
    return newSale;
  }

  private generateVoucherNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const sales = this.getSales();
    const todaySales = sales.filter(s => s.createdAt.startsWith(today.toISOString().slice(0, 10)));
    const nextNumber = (todaySales.length + 1).toString().padStart(3, '0');
    return `V${dateStr}${nextNumber}`;
  }

  // User methods
  getUsers(): User[] {
    return this.load<User>('users');
  }

  saveUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.save('users', users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
    };
    this.save('users', users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    this.save('users', filtered);
    return true;
  }

  // Initialize with sample data
  initializeDatabase(): void {
    if (this.getProducts().length === 0) {
      const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
        { name: 'Coca Cola 250ml', barcode: '8851234567890', costPrice: 300, salePrice: 500, quantity: 50, category: 'Beverages' },
        { name: 'Mama Instant Noodles', barcode: '8851234567891', costPrice: 400, salePrice: 600, quantity: 3, category: 'Food' },
        { name: 'Lay\'s Chips', barcode: '8851234567892', costPrice: 600, salePrice: 1000, quantity: 0, category: 'Snacks' },
        { name: 'Nivea Face Cream', barcode: '8851234567893', costPrice: 2000, salePrice: 3500, quantity: 15, category: 'Beauty' },
        { name: 'Panadol 500mg', barcode: '8851234567894', costPrice: 800, salePrice: 1200, quantity: 2, category: 'Medicine' },
      ];
      
      sampleProducts.forEach(product => this.saveProduct(product));
    }

    if (this.getUsers().length === 0) {
      this.saveUser({ username: 'admin', password: 'admin123', role: 'admin' });
      this.saveUser({ username: 'staff', password: 'staff123', role: 'staff' });
    }
  }

  // Analytics methods
  getTodaysSales(): { totalSale: number; totalCost: number; totalProfit: number; voucherCount: number } {
    const today = new Date().toISOString().slice(0, 10);
    const sales = this.getSales().filter(s => s.createdAt.startsWith(today));
    
    return {
      totalSale: sales.reduce((sum, sale) => sum + sale.totalSale, 0),
      totalCost: sales.reduce((sum, sale) => sum + sale.totalCost, 0),
      totalProfit: sales.reduce((sum, sale) => sum + sale.totalProfit, 0),
      voucherCount: sales.length,
    };
  }

  getInventoryStats(): { total: number; lowStock: number; outOfStock: number } {
    const products = this.getProducts();
    return {
      total: products.length,
      lowStock: products.filter(p => p.quantity > 0 && p.quantity < 5).length,
      outOfStock: products.filter(p => p.quantity === 0).length,
    };
  }
}

export const db = new LocalDatabase();