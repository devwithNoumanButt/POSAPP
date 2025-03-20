"use client";

import React from 'react';
import { DollarSign, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { StatCard } from './StatCard';
import type { Sale } from '@/types';

export default function Statistics() {
  const { sales } = useAppContext();

  const totalSales = (sales as Sale[]).reduce((acc, sale) => acc + sale.total, 0);
  const recentSales = sales.slice(-5);

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
            <div key={sale.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Sale ID: {sale.id}</p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(sale.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <span className="font-semibold">₨{sale.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}