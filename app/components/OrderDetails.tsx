"use client";

import React, { useEffect } from 'react';
import { Calendar, Package, User, CreditCard, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

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

  const handleDownloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for Excel - Flatten the sales data
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

    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  useEffect(() => {
    if (sales.length > 0) {
      sales.forEach(sale => {
        fetchOrderDetails(sale.id).then(data => console.log('Order Details:', data));
      });
    }
  }, [sales]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
        <button
          onClick={handleDownloadExcel}
          disabled={sales.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5" />
          <span>Download Excel</span>
        </button>
      </div>

      <div className="space-y-6">
        {sales.length === 0 ? (
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

                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">₨{sale.total.toFixed(2)}</h3>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>

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
                        <td className="py-4 text-right">₨{(item.totalAfterDiscount ?? item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">
                        Total Items:
                      </td>
                      <td className="py-4 text-right font-semibold">
                        {sale.items.reduce((acc, item) => acc + (item.quantity ?? 1), 0)}
                      </td>
                    </tr>
                    <tr>
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