import React, { useState, useEffect } from 'react';
import { Calendar, Package, User, CreditCard, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function OrderDetails() {
  const { sales, setSales } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all orders with user information
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            users (
              id,
              name,
              email,
              phone_number
            )
          `)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        if (!ordersData || ordersData.length === 0) {
          setSales([]);
          setLoading(false);
          return;
        }

        // Get all order items with product information
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products (
              id,
              name,
              code,
              price,
              description,
              category_id
            )
          `)
          .in('order_id', ordersData.map(order => order.id));

        if (itemsError) throw itemsError;

        // Get all categories for reference
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        // Create a map of category IDs to category names for easier lookup
        const categoryMap = {};
        if (categoriesData) {
          categoriesData.forEach(category => {
            categoryMap[category.id] = category.name;
          });
        }

        const formattedSales = ordersData.map(order => {
          const orderItems = itemsData.filter(item => item.order_id === order.id);
          return {
            id: order.id,
            date: order.created_at,
            customerName: order.customer_name || (order.users ? order.users.name : 'Walk-in Customer'),
            phoneNumber: order.phone_number || (order.users ? order.users.phone_number || order.users.email : null),
            total: order.total,
            tenderedAmount: order.tendered_amount || 0,
            change: order.change || 0,
            items: orderItems.map(item => {
              const product = item.products;
              const categoryName = product && product.category_id ? 
                categoryMap[product.category_id] || 'Uncategorized' : 
                'Uncategorized';
              
              return {
                name: product ? product.name : 'Unknown Product',
                code: product ? product.code : '',
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                totalAfterDiscount: item.quantity * item.price * (1 - (item.discount || 0) / 100),
                category: categoryName,
                description: product ? product.description : ''
              };
            })
          };
        });

        setSales(formattedSales);
      } catch (error) {
        setError('Failed to fetch order details');
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [setSales]);

  const handleDownloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
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
          'Item Total': item.totalAfterDiscount,
          'Category': item.category,
          'Description': item.description
        }));
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, 
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, 
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, 
        { wch: 12 }, { wch: 20 }, { wch: 30 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');

      const fileName = `Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
        <button
          onClick={handleDownloadExcel}
          disabled={sales.length === 0 || loading}
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
                      <th className="pb-4 text-right">Category</th>
                      <th className="pb-4 text-right">Description</th>
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
                        <td className="py-4 text-right">₨{(item.totalAfterDiscount ?? 0).toFixed(2)}</td>
                        <td className="py-4 text-right">{item.category}</td>
                        <td className="py-4 text-right">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Total Items:</td>
                      <td className="py-4 text-right font-semibold">
                        {sale.items.reduce((acc, item) => acc + (item.quantity ?? 1), 0)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Total Amount:</td>
                      <td className="py-4 text-right font-semibold">₨{sale.total.toFixed(2)}</td>
                      <td colSpan={2} />
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Cash Received:</td>
                      <td className="py-4 text-right font-semibold">₨{(sale.tenderedAmount ?? 0).toFixed(2)}</td>
                      <td colSpan={2} />
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-4 text-right font-semibold">Change:</td>
                      <td className="py-4 text-right font-semibold">₨{(sale.change ?? 0).toFixed(2)}</td>
                      <td colSpan={2} />
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