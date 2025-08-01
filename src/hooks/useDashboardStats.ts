
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';

interface DashboardStats {
  today: {
    totalSale: number;
    totalCost: number;
    totalProfit: number;
    voucherCount: number;
  };
  thisMonth: {
    totalSale: number;
    totalCost: number;
    totalProfit: number;
    voucherCount: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    today: { totalSale: 0, totalCost: 0, totalProfit: 0, voucherCount: 0 },
    thisMonth: { totalSale: 0, totalCost: 0, totalProfit: 0, voucherCount: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0 },
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get today's stats
      const todayStats = await db.getTodaysSales();
      
      // Get this month's stats
      const sales = await db.getSales();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= startOfMonth;
      });
      
      const thisMonthStats = {
        totalSale: monthSales.reduce((sum, sale) => sum + sale.totalSale, 0),
        totalCost: monthSales.reduce((sum, sale) => sum + sale.totalCost, 0),
        totalProfit: monthSales.reduce((sum, sale) => sum + sale.totalProfit, 0),
        voucherCount: monthSales.length,
      };
      
      // Get inventory stats
      const inventoryStats = await db.getInventoryStats();
      
      setStats({
        today: todayStats,
        thisMonth: thisMonthStats,
        inventory: inventoryStats,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, refetch: loadStats };
};
