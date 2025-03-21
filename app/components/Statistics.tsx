'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Package, User, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createClient } from '@supabase/supabase-js';

// Define types
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface OrderData {
  id: number;
  total: number;
  created_at: string;
  user_id: string | null;
  customer_name?: string | null;
  tendered_amount: number;
  change: number;
  phone_number?: string | null;
}

interface OrderItemData {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount: number;
  product?: {
    name: string;
  } | null;
}

interface OrderWithProductDetails extends OrderData {
  order_items?: OrderItemData[] | null;
}

// Create Supabase client inside component to avoid SSR issues
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function Statistics() {
  // States
  const [sales, setSales] = useState<OrderWithProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<number>(0);
  const [todaySales, setTodaySales] = useState<number>(0);

  useEffect(() => {
    // Prevent execution during SSR
    if (typeof window === 'undefined') return;
    
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = createSupabaseClient();
        
        // Fetch orders with related order_items and products
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*, product:products(name))
          `)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        // Handle null/undefined data
        if (!ordersData) {
          setSales([]);
          setCustomers(0);
          setTodaySales(0);
          return;
        }
        
        // Get unique customer count
        const uniqueCustomers = new Set();
        ordersData.forEach(order => {
          if (order.user_id) uniqueCustomers.add(order.user_id);
          else if (order.customer_name) uniqueCustomers.add(order.customer_name);
        });
        
        // Calculate today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySalesAmount = ordersData
          .filter(order => new Date(order.created_at) >= today)
          .reduce((sum, order) => sum + Number(order.total || 0), 0);
        
        // Ensure proper typing and handle nulls
        const salesData = ordersData.map(order => ({
          id: order.id || 0,
          total: Number(order.total || 0),
          created_at: order.created_at || new Date().toISOString(),
          user_id: order.user_id || null,
          customer_name: order.customer_name || null,
          tendered_amount: Number(order.tendered_amount || 0),
          change: Number(order.change || 0),
          phone_number: order.phone_number || null,
          order_items: order.order_items || []
        }));
        
        setSales(salesData);
        setCustomers(uniqueCustomers.size);
        setTodaySales(todaySalesAmount);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading statistics...</div>;
  if (error) return <div className="bg-red-100 p-4 rounded-lg text-red-700">{error}</div>;
  
  // Calculate derived values for display
  const totalSales = sales.reduce((acc, sale) => acc + Number(sale.total || 0), 0);
  const recentSales = sales.slice(0, 5);
  const averageOrderValue = sales.length > 0 ? totalSales / sales.length : 0;
  
  // Find highest transaction safely
  const highestTransaction = sales.length ? 
    Math.max(...sales.map(s => Number(s.total || 0))) : 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`₨${totalSales.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Transactions"
          value={sales.length}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Unique Customers"
          value={customers}
          icon={User}
          color="bg-purple-500"
        />
        <StatCard
          title="Today's Sales"
          value={`₨${todaySales.toFixed(2)}`}
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-medium">₨{averageOrderValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Highest Transaction</span>
              <span className="font-medium">₨{highestTransaction.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent sales available
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={`card-${sale.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Sale #{sale.id}</p>
                      {sale.customer_name && (
                        <p className="text-sm text-gray-600">Customer: {sale.customer_name}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">₨{Number(sale.total).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Sales Breakdown Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Sales Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSales.map((sale) => (
                <tr key={`table-${sale.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer_name || 'Guest Customer'}
                    {sale.phone_number && <span className="block text-xs text-gray-500">{sale.phone_number}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(sale.order_items?.length || 0)} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₨{Number(sale.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}