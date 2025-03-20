import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Calculator, Printer, X, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useUser } from '@clerk/nextjs';

interface OrderItem {
  id: number;
  productId: number; // Actual Supabase product ID
  name: string;
  price: number;
  code: string;
  category: string;
  description: string;
  quantity: number;
  discount: number;
  subtotal: number;
  totalAfterDiscount: number;
}

export default function POS() {
  const { user } = useUser();
  const { addSale } = useAppContext();
  const [products, setProducts] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [discount, setDiscount] = useState<string>('0');
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch products from Supabase');
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      setProducts(
        data.map(product => ({
          id: product.id,
          productId: product.id, // Assuming productId is the same as id
          name: product.name,
          price: product.price,
          code: product.code || '',
          category: product.categories.name,
          description: product.description || '',
          quantity: 0, // Default value
          discount: 0, // Default value
          subtotal: 0, // Default value
          totalAfterDiscount: 0 // Default value
        }))
      );
    } catch (err: any) {
      setFetchError(err.message || 'An unexpected error occurred while fetching products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const calculateTotal = useCallback(() => {
    const total = orderItems.reduce((acc, item) => acc + item.totalAfterDiscount, 0);
    setTotalAmount(total);
  }, [orderItems]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find(p => p.code === e.target.value);
    if (product) {
      setSelectedProduct({
        ...product,
        id: Date.now(), // Temporary ID for local uniqueness
        productId: product.id!, // Actual Supabase ID
        quantity: 1,
        discount: 0,
        subtotal: product.price,
        totalAfterDiscount: product.price,
      });
    }
  };

  const calculateItemTotals = (price: number, qty: number, disc: number) => {
    const subtotal = price * qty;
    const discountAmount = (subtotal * disc) / 100;
    return {
      subtotal,
      totalAfterDiscount: subtotal - discountAmount,
    };
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      setSubmitError('Please select a product');
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) < 1) {
      setSubmitError('Quantity must be a positive number');
      return;
    }

    if (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100) {
      setSubmitError('Discount must be between 0 and 100');
      return;
    }

    setOrderItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.code === selectedProduct.code);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + Number(quantity);
        const { subtotal, totalAfterDiscount } = calculateItemTotals(
          existingItem.price,
          newQuantity,
          Number(discount)
        );

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          discount: Number(discount),
          subtotal,
          totalAfterDiscount,
        };
        return updatedItems;
      }

      const { subtotal, totalAfterDiscount } = calculateItemTotals(
        selectedProduct.price,
        Number(quantity),
        Number(discount)
      );

      return [
        ...prev,
        {
          ...selectedProduct,
          quantity: Number(quantity),
          discount: Number(discount),
          subtotal,
          totalAfterDiscount,
        },
      ];
    });

    setSelectedProduct(null);
    setQuantity('1');
    setDiscount('0');
    setSubmitError(null);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrint = async () => {
    if (orderItems.length === 0) {
      setSubmitError('No items in the order');
      return;
    }

    const tendered = Number(tenderedAmount);
    if (!tenderedAmount || isNaN(tendered) || tendered < totalAmount) {
      setSubmitError('Tendered amount must be greater than or equal to the total amount');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      // Check if user exists in the users table if user_id is provided
      let userIdToInsert: string | null = null;
      if (user?.id) {
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') { // Ignore "no rows" error
          throw new Error(userError.message || 'Failed to check user existence');
        }

        if (existingUser) {
          userIdToInsert = user.id;
        } else {
          // Optionally insert the user if they don’t exist (adjust schema as needed)
          const { error: insertUserError } = await supabase.from('users').insert({
            id: user.id,
            name: user.fullName || 'Unknown',
            email: user.primaryEmailAddress?.emailAddress || null,
          });

          if (insertUserError) {
            console.warn('Failed to insert user, proceeding without user_id:', insertUserError);
          } else {
            userIdToInsert = user.id;
          }
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userIdToInsert, // Use null if no valid user_id
          total: totalAmount,
          tendered_amount: tendered,
          change: tendered - totalAmount,
          customer_name: customerName.trim() || null,
          phone_number: phoneNumber.trim() || null,
        })
        .select()
        .single();

      if (orderError) {
        if (orderError.code === '23503') { // Foreign key violation
          throw new Error(
            'User ID not found in users table. Please ensure users are synced or make user_id nullable.'
          );
        }
        throw new Error(orderError.message || 'Failed to save order to Supabase');
      }

      if (!orderData) {
        throw new Error('No order data returned from Supabase');
      }

      const orderItemsData = orderItems.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to save order items to Supabase');
      }

      const sale = {
        id: orderData.id,
        items: orderItems.map(item => ({
          name: item.name,
          category: item.category || '',
          price: item.price,
          code: item.code,
          description: item.description || '',
          quantity: item.quantity,
          discount: item.discount,
          totalAfterDiscount: item.totalAfterDiscount,
        })),
        total: totalAmount,
        date: orderData.created_at,
        customerName: customerName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        tenderedAmount: tendered,
        change: tendered - totalAmount,
      };

      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${sale.id}</title>
              <style>
                @page { margin: 0; padding: 0; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 0; background: white; }
                .receipt-wrapper { width: 80mm; padding: 0; overflow: hidden; }
                .receipt-content { padding: 3mm; }
                .header { text-align: center; margin-bottom: 3mm; }
                .store-name { font-weight: bold; font-size: 12pt; }
                .store-info { font-size: 9pt; line-height: 1.2; }
                .divider { border-top: 1px dashed #000; margin: 2mm 0; }
                .info { font-size: 9pt; line-height: 1.2; }
                .items { margin: 2mm 0; }
                .item { font-size: 9pt; line-height: 1.2; }
                .item-details { padding-left: 3mm; font-size: 9pt; }
                .totals { font-size: 9pt; line-height: 1.2; }
                .footer { text-align: center; font-size: 9pt; margin-top: 2mm; }
                @media print { @page { margin: 0; padding: 0; } html, body { width: 80mm; margin: 0; padding: 0; } .receipt-wrapper { page-break-after: always; } }
              </style>
            </head>
            <body>
              <div class="receipt-wrapper">
                <div class="receipt-content">
                  <div class="header">
                    <div class="store-name">Fashion Arena</div>
                    <div class="store-info">
                      Opp. Prisma Mall Basement of<br>
                      Cafecito Grw<br>
                      Cantt.<br>
                      Phone: 055-386577 / 0321-<br>
                      7456467
                    </div>
                  </div>
                  <div class="info">
                    Invoice No: ${sale.id}<br>
                    Date: ${new Date(sale.date).toLocaleString()}<br>
                    Customer: ${sale.customerName || '#'}<br>
                    Phone: ${sale.phoneNumber || '#'}
                  </div>
                  <div class="divider"></div>
                  <div class="items">
                    ${sale.items
                      .map(
                        (item, index) => `
                      <div class="item">
                        ${index + 1}. ${item.name}<br>
                        <div class="item-details">
                          ${item.quantity} @ ${item.price.toFixed(2)} = ${item.totalAfterDiscount.toFixed(
                          2
                        )}
                        ${item.discount > 0 ? ` (Disc: ${item.discount}%)` : ''}
                      </div>
                    </div>
                    `
                      )
                      .join('')}
                  </div>
                  <div class="divider"></div>
                  <div class="totals">
                    Total Items: ${sale.items.reduce((acc, item) => acc + item.quantity, 0)}<br>
                    Gross Amount: ₨${sale.total.toFixed(2)}<br>
                    Amount Payable: ₨${sale.total.toFixed(2)}<br>
                    Cash Received: ₨${sale.tenderedAmount.toFixed(2)}<br>
                    Change: ₨${sale.change.toFixed(2)}
                  </div>
                  <div class="divider"></div>
                  <div class="footer">
                    Thank you for shopping!<br>
                    Please come again
                  </div>
                </div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 250);
                  }, 100);
                }
              </script>
            </body>
          </html>
        `);
        receiptWindow.document.close();
      }

      addSale(sale);
      setShowPaymentModal(false);
      setOrderItems([]);
      setCustomerName('');
      setPhoneNumber('');
      setTenderedAmount('');
      setTotalAmount(0);
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred while processing the order');
      console.error('Order processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const change = Number(tenderedAmount) - totalAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {fetchError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{fetchError}</div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{submitError}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter customer name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-4">Add Products</h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products by name or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
              <select
                value={selectedProduct?.code || ''}
                onChange={handleProductSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                disabled={loading}
              >
                <option value="">Choose product</option>
                {filteredProducts.map(product => (
                  <option key={product.code} value={product.code}>
                    {product.name} - ₨{product.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {filteredProducts.length === 0 && searchQuery && (
                <p className="text-sm text-red-600 mt-1">
                  No products found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              onClick={handleAddItem}
              disabled={!selectedProduct || loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Order
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    ₨{item.price.toFixed(2)} x {item.quantity}
                    {item.discount > 0 && ` (-${item.discount}%)`}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-semibold">₨{item.totalAfterDiscount.toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            {orderItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">No items added to order</div>
            )}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-600">
                  ₨{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={orderItems.length === 0 || loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Calculator className="h-5 w-5" />
            <span>Complete Order</span>
          </button>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payable Amount
                </label>
                <input
                  type="text"
                  value={`₨${totalAmount.toFixed(2)}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tendered Amount
                </label>
                <input
                  type="number"
                  value={tenderedAmount}
                  onChange={e => setTenderedAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  min={totalAmount}
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change</label>
                <input
                  type="text"
                  value={change >= 0 ? `₨${change.toFixed(2)}` : '₨0.00'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
            </div>
            <button
              onClick={handlePrint}
              disabled={!tenderedAmount || Number(tenderedAmount) < totalAmount || loading}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Printer className="h-5 w-5" />
              <span>{loading ? 'Processing...' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}