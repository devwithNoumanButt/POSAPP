<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
"use client";

import React, { useState, useEffect } from 'react';
>>>>>>> backend setup
import { DollarSign, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

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

<<<<<<< HEAD
const fetchStatistics = async () => {
  const { data, error } = await supabase
    .from('statistics')
    .select('*');

  if (error) console.error(error);
  return data;
};

export default function Statistics() {
  const { sales } = useAppContext();
=======
export default function Statistics() {
  const { sales, setSales } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(name, code, price)')
        .in('order_id', ordersData.map(order => order.id));

      if (itemsError) throw itemsError;

      const formattedSales = ordersData.map(order => {
        const orderItems = itemsData.filter(item => item.order_id === order.id);
        return {
          id: order.id,
          date: order.created_at,
          customerName: order.customer_name || order.users?.name || 'Walk-in Customer',
          phoneNumber: order.phone_number || order.users?.email,
          total: order.total,
          tenderedAmount: order.tendered_amount || 0,
          change: order.change || 0,
          items: orderItems.map(item => ({
            name: item.products.name,
            code: item.products.code,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            totalAfterDiscount: item.quantity * item.price * (1 - (item.discount || 0) / 100)
          }))
        };
      });

      setSales(formattedSales);
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> backend setup

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const recentSales = sales.slice(-5);

<<<<<<< HEAD
  useEffect(() => {
    fetchStatistics().then(data => console.log('Statistics:', data));
  }, []);

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
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
        <div className="space-y-4">
          {recentSales.map((sale, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Sale ID: {sale.id}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(sale.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold">₨{sale.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
=======
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading statistics...
        </div>
      ) : (
        <>
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
              color="bg-orange-500"
            />
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
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sale ID: {sale.id}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">₨{sale.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
>>>>>>> backend setup
    </div>
  );
}