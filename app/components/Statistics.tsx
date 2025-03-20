import React, { useState, useEffect } from 'react';
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

export default function Statistics() {
  const { sales, setSales } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('statistics').select('*');
        if (error) throw error;
        setSales(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [setSales]);

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const recentSales = sales.slice(-5);

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
    </div>
  );
}