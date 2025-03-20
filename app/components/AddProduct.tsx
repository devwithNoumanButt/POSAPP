import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { products, categories, setProducts, addProduct } = useAppContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        // setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setFetchError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

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

        // Replace products to avoid duplicates
        setProducts(
          data.map(product => ({
            id: product.id,
            name: product.name,
            category: product.categories.name,
            price: product.price,
            code: product.code || '',
            description: product.description || '',
          }))
        );
      } catch (err: any) {
        setFetchError(err.message || 'An unexpected error occurred while fetching products');
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [setProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.name.trim()) {
      setSubmitError('Product name is required');
      return;
    }
    if (!formData.category) {
      setSubmitError('Please select a category');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setSubmitError('Please enter a valid price (greater than or equal to 0)');
      return;
    }

    // Check for duplicate product code locally
    if (formData.code && products.some(p => p.code === formData.code)) {
      setSubmitError('Product code already exists');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const price = parseFloat(formData.price);
      const selectedCategory = categories.find(cat => cat.name === formData.category);

      if (!selectedCategory || !selectedCategory.id) {
        throw new Error('Selected category is invalid or missing ID');
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: formData.name.trim(),
          category_id: selectedCategory.id,
          price,
          code: formData.code.trim() || null,
          description: formData.description.trim() || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation (e.g., duplicate code)
          throw new Error('Product code already exists in database');
        }
        throw new Error(error.message || 'Failed to add product to Supabase');
      }

      if (!data) {
        throw new Error('No data returned after adding product');
      }

      // Add the new product to context
      addProduct({
        id: data.id,
        name: data.name,
        category: formData.category,
        price: data.price,
        code: data.code || '',
        description: data.description || '',
      });

      // Reset form
      setFormData({
        name: '',
        category: '',
        price: '',
        code: '',
        description: '',
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred while adding product');
      console.error('Add product error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>

        {fetchError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {fetchError}
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter product name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter product code (e.g., KD001A)"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                disabled={loading}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₨)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter price"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter product description"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>{loading ? 'Adding...' : 'Add Product'}</span>
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">View Products</h2>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No products found</div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">Code: {product.code || 'N/A'}</p>
                <p className="text-sm text-gray-500">Category: {product.category}</p>
                <p className="text-sm text-gray-500">Price: ₨{product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Description: {product.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}