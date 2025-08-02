import { supabase } from '@/integrations/supabase/client';

// Data types
export interface Product {
  id: string;
  name: string;
  barcode?: string;
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

class SupabaseDatabase {
  // Product methods
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(product => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode || '',
      costPrice: parseFloat(String(product.cost_price || 0)),
      salePrice: parseFloat(String(product.sale_price || 0)),
      quantity: product.quantity || 0,
      category: product.category || 'General',
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    })) || [];
  }

  async saveProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        barcode: product.barcode || null,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        quantity: product.quantity,
        category: product.category || 'General',
      })
      .select()
      .maybeSingle();
    
    if (error || !data) throw error || new Error('Failed to create product');
    
    return {
      id: data.id,
      name: data.name,
      barcode: data.barcode || '',
      costPrice: parseFloat(String(data.cost_price)),
      salePrice: parseFloat(String(data.sale_price)),
      quantity: data.quantity,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.barcode !== undefined) updateData.barcode = updates.barcode || null;
    if (updates.costPrice !== undefined) updateData.cost_price = updates.costPrice;
    if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.category !== undefined) updateData.category = updates.category;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) return null;
    
    return {
      id: data.id,
      name: data.name,
      barcode: data.barcode || '',
      costPrice: parseFloat(String(data.cost_price)),
      salePrice: parseFloat(String(data.sale_price)),
      quantity: data.quantity,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async findProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      barcode: data.barcode || '',
      costPrice: parseFloat(String(data.cost_price)),
      salePrice: parseFloat(String(data.sale_price)),
      quantity: data.quantity,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // Sale methods
  async getSales(): Promise<Sale[]> {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (salesError) throw salesError;
    
    const sales: Sale[] = [];
    
    for (const sale of salesData || []) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);
      
      if (itemsError) continue;
      
      const items: SaleItem[] = itemsData?.map(item => ({
        productId: item.product_id || '',
        productName: item.product_name,
        quantity: item.quantity,
        costPrice: parseFloat(String(item.cost_price)),
        salePrice: parseFloat(String(item.sale_price)),
        totalCost: parseFloat(String(item.total_cost)),
        totalSale: parseFloat(String(item.total_sale)),
        profit: parseFloat(String(item.profit)),
      })) || [];
      
      sales.push({
        id: sale.id,
        voucherNumber: sale.voucher_number,
        items,
        totalCost: parseFloat(String(sale.total_cost)),
        totalSale: parseFloat(String(sale.total_sale)),
        totalProfit: parseFloat(String(sale.total_profit)),
        receivedAmount: parseFloat(String(sale.received_amount)),
        changeAmount: parseFloat(String(sale.change_amount)),
        createdAt: sale.created_at,
        createdBy: sale.created_by || '',
      });
    }
    
    return sales;
  }

  async saveSale(sale: Omit<Sale, 'id' | 'voucherNumber' | 'createdAt'>): Promise<Sale> {
    // Generate voucher number
    const { data: voucherData } = await supabase.rpc('generate_voucher_number');
    const voucherNumber = voucherData || `V${Date.now()}`;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Insert sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        voucher_number: voucherNumber,
        total_cost: sale.totalCost,
        total_sale: sale.totalSale,
        total_profit: sale.totalProfit,
        received_amount: sale.receivedAmount,
        change_amount: sale.changeAmount,
        created_by: user?.id || null,
      })
      .select()
      .maybeSingle();
    
    if (saleError || !saleData) throw saleError || new Error('Failed to create sale');
    
    // Insert sale items
    const saleItemsData = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      cost_price: item.costPrice,
      sale_price: item.salePrice,
      total_cost: item.totalCost,
      total_sale: item.totalSale,
      profit: item.profit,
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData);
    
    if (itemsError) throw itemsError;
    
    // Update product quantities
    for (const item of sale.items) {
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.productId)
        .maybeSingle();
      
      if (product) {
        await supabase
          .from('products')
          .update({ quantity: product.quantity - item.quantity })
          .eq('id', item.productId);
      }
    }
    
    return {
      id: saleData.id,
      voucherNumber: saleData.voucher_number,
      items: sale.items,
      totalCost: parseFloat(String(saleData.total_cost)),
      totalSale: parseFloat(String(saleData.total_sale)),
      totalProfit: parseFloat(String(saleData.total_profit)),
      receivedAmount: parseFloat(String(saleData.received_amount)),
      changeAmount: parseFloat(String(saleData.change_amount)),
      createdAt: saleData.created_at,
      createdBy: saleData.created_by || '',
    };
  }

  generateVoucherNumber(): string {
    // This is handled by the database function, but keeping for compatibility
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `V${dateStr}${randomNum}`;
  }

  // User methods (for backward compatibility, but auth is handled by Supabase Auth)
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    
    return data?.map(profile => ({
      id: profile.user_id,
      username: profile.username,
      password: '***', // Don't expose passwords
      role: profile.role,
      createdAt: profile.created_at,
    })) || [];
  }

  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // In real implementation, this would use Supabase Auth
    // For now, return a mock user
    return {
      id: Date.now().toString(),
      username: user.username,
      password: '***',
      role: user.role,
      createdAt: new Date().toISOString(),
    };
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    if (updates.username || updates.role) {
      const updateData: any = {};
      if (updates.username) updateData.username = updates.username;
      if (updates.role) updateData.role = updates.role;

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', id)
        .select()
        .maybeSingle();
      
      if (error) return null;
      
      return {
        id: data.user_id,
        username: data.username,
        password: '***',
        role: data.role,
        createdAt: data.created_at,
      };
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', id);
    
    return !error;
  }

  // Category methods
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (error) return ['General'];
    
    return data?.map(cat => cat.name) || ['General'];
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null> {
    const updateData: any = {};
    if (updates.totalCost !== undefined) updateData.total_cost = updates.totalCost;
    if (updates.totalSale !== undefined) updateData.total_sale = updates.totalSale;
    if (updates.totalProfit !== undefined) updateData.total_profit = updates.totalProfit;
    if (updates.receivedAmount !== undefined) updateData.received_amount = updates.receivedAmount;
    if (updates.changeAmount !== undefined) updateData.change_amount = updates.changeAmount;

    const { data, error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error || !data) return null;
    
    // Get sale items
    const { data: itemsData } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', id);
    
    const items: SaleItem[] = itemsData?.map(item => ({
      productId: item.product_id || '',
      productName: item.product_name,
      quantity: item.quantity,
      costPrice: parseFloat(String(item.cost_price)),
      salePrice: parseFloat(String(item.sale_price)),
      totalCost: parseFloat(String(item.total_cost)),
      totalSale: parseFloat(String(item.total_sale)),
      profit: parseFloat(String(item.profit)),
    })) || [];
    
    return {
      id: data.id,
      voucherNumber: data.voucher_number,
      items,
      totalCost: parseFloat(String(data.total_cost)),
      totalSale: parseFloat(String(data.total_sale)),
      totalProfit: parseFloat(String(data.total_profit)),
      receivedAmount: parseFloat(String(data.received_amount)),
      changeAmount: parseFloat(String(data.change_amount)),
      createdAt: data.created_at,
      createdBy: data.created_by || '',
    };
  }

  async deleteSale(id: string): Promise<boolean> {
    // Get sale items first to restore quantities
    const { data: itemsData } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', id);
    
    // Restore product quantities
    if (itemsData) {
      for (const item of itemsData) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .maybeSingle();
        
        if (product) {
          await supabase
            .from('products')
            .update({ quantity: product.quantity + item.quantity })
            .eq('id', item.product_id);
        }
      }
    }
    
    // Delete sale (items will be deleted by cascade)
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Analytics methods
  async getTodaysSales(): Promise<{ totalSale: number; totalCost: number; totalProfit: number; voucherCount: number }> {
    const today = new Date().toISOString().slice(0, 10);
    
    const { data, error } = await supabase
      .from('sales')
      .select('total_sale, total_cost, total_profit')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);
    
    if (error || !data) {
      return { totalSale: 0, totalCost: 0, totalProfit: 0, voucherCount: 0 };
    }
    
    return {
      totalSale: data.reduce((sum, sale) => sum + parseFloat(String(sale.total_sale || 0)), 0),
      totalCost: data.reduce((sum, sale) => sum + parseFloat(String(sale.total_cost || 0)), 0),
      totalProfit: data.reduce((sum, sale) => sum + parseFloat(String(sale.total_profit || 0)), 0),
      voucherCount: data.length,
    };
  }

  async getInventoryStats(): Promise<{ total: number; lowStock: number; outOfStock: number }> {
    const { data, error } = await supabase
      .from('products')
      .select('quantity');
    
    if (error || !data) {
      return { total: 0, lowStock: 0, outOfStock: 0 };
    }
    
    return {
      total: data.length,
      lowStock: data.filter(p => p.quantity > 0 && p.quantity < 5).length,
      outOfStock: data.filter(p => p.quantity === 0).length,
    };
  }

  // Initialize database (no longer needed with Supabase)
  initializeDatabase(): void {
    // Database is already initialized with migrations
    console.log('Database initialized with Supabase');
  }
}

export const db = new SupabaseDatabase();
