"use client";

<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> backend setup
import { Calendar, Package, User, CreditCard, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

<<<<<<< HEAD
const fetchOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId);

  if (error) console.error(error);
  return data;
};

export default function OrderDetails() {
  const { sales } = useAppContext();
=======
export default function OrderDetails() {
  const { sales, setSales } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
      setError('Failed to fetch order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> backend setup

  const handleDownloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
<<<<<<< HEAD
      // Prepare data for Excel - Flatten the sales data
=======
>>>>>>> backend setup
      const excelData = sales.flatMap(sale => {
        return sale.items.map(item => ({
          'Order ID': sale.id,
          'Date': new Date(sale.date).toLocaleString(),
          'Customer Name': sale.customerName || '',
          'Phone Number': sale.phoneNumber || '',
          'Total Amount': sale.total,
          'Cash Received': sale.tenderedAmount,
          'Change': sale.change,
          'Product Name': item.name,
          'Product Code': item.code,
          'Quantity': item.quantity,
          'Unit Price': item.price,
          'Discount %': item.discount,
          'Item Total': item.totalAfterDiscount
        }));
      });

<<<<<<< HEAD
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Order ID
        { wch: 20 }, // Date
        { wch: 15 }, // Customer Name
        { wch: 15 }, // Phone Number
        { wch: 12 }, // Total Amount
        { wch: 12 }, // Cash Received
        { wch: 10 }, // Change
        { wch: 30 }, // Product Name
        { wch: 12 }, // Product Code
        { wch: 10 }, // Quantity
        { wch: 10 }, // Unit Price
        { wch: 10 }, // Discount %
        { wch: 12 }  // Item Total
      ];
      ws['!cols'] = colWidths;

      // Create workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');

      // Generate Excel file
      const fileName = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

=======
      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, 
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, 
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
        { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');

      const fileName = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
>>>>>>> backend setup
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    if (sales.length > 0) {
      sales.forEach(sale => {
        fetchOrderDetails(sale.id).then(data => console.log('Order Details:', data));
      });
    }
  }, [sales]);

=======
>>>>>>> backend setup
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
        <button
          onClick={handleDownloadExcel}
<<<<<<< HEAD
          disabled={sales.length === 0}
=======
          disabled={sales.length === 0 || loading}
>>>>>>> backend setup
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5" />
          <span>Download Excel</span>
        </button>
      </div>

<<<<<<< HEAD
      <div className="space-y-6">
        {sales.length === 0 ? (
=======
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading orders...
          </div>
        ) : sales.length === 0 ? (
>>>>>>> backend setup
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex flex-wrap gap-6 justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Package className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">{sale.id}</h3>
                      <p className="text-sm text-gray-500">Order ID</p>
                    </div>
                  </div>
<<<<<<< HEAD

                  <div className="flex items-center space-x-4">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">
                        {sale.customerName || 'Walk-in Customer'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sale.phoneNumber || 'No phone number'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">
                        {new Date(sale.date).toLocaleDateString()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

=======
                  <div className="flex items-center space-x-4">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{sale.customerName}</h3>
                      <p className="text-sm text-gray-500">{sale.phoneNumber || 'No phone number'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold">{new Date(sale.date).toLocaleDateString()}</h3>
                      <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
>>>>>>> backend setup
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">₨{sale.total.toFixed(2)}</h3>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
<<<<<<< HEAD

=======
>>>>>>> backend setup
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
<<<<<<< HEAD

=======
>>>>>>> backend setup
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-4">Item</th>
                      <th className="pb-4 text-center">Quantity</th>
                      <th className="pb-4 text-right">Price</th>
                      <th className="pb-4 text-right">Discount</th>
                      <th className="pb-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Code: {item.code}</p>
                          </div>
                        </td>
                        <td className="py-4 text-center">{item.quantity}</td>
                        <td className="py-4 text-right">₨{item.price.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          {(item.discount ?? 0) > 0 ? `${item.discount}%` : '-'}
                        </td>
<<<<<<< HEAD
                        <td className="py-4 text-right">₨{(item.totalAfterDiscount ?? item.price).toFixed(2)}</td>
=======
                        <td className="py-4 text-right">₨{item.totalAfterDiscount.toFixed(2)}</td>
>>>>>>> backend setup
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
<<<<<<< HEAD
                      <td colSpan={4} className="py-4 text-right font-semibold">
                        Total Items:
                      </td>
=======
                      <td colSpan={4} className="py-4 text-right font-semibold">Total Items:</td>
>>>>>>> backend setup
                      <td className="py-4 text-right font-semibold">
                        {sale.items.reduce((acc, item) => acc + (item.quantity ?? 1), 0)}
                      </td>
                    </tr>
                    <tr>
<<<<<<< HEAD
                      <td colSpan={4} className="py-4 text-right font-semibold">
                        Total Amount:
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ₨{sale.total.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">
                        Cash Received:
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ₨{(sale.tenderedAmount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">
                        Change:
                      </td>
                      <td className="py-4 text-right font-semibold">
                        ₨{(sale.change ?? 0).toFixed(2)}
                      </td>
=======
                      <td colSpan={4} className="py-4 text-right font-semibold">Total Amount:</td>
                      <td className="py-4 text-right font-semibold">₨{sale.total.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Cash Received:</td>
                      <td className="py-4 text-right font-semibold">₨{sale.tenderedAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Change:</td>
                      <td className="py-4 text-right font-semibold">₨{sale.change.toFixed(2)}</td>
>>>>>>> backend setup
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}