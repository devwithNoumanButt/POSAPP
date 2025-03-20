<<<<<<< HEAD
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase'; // Assuming you have a supabase instance set up

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState('');
  const { categories, addCategory } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName) {
      const { error } = await supabase.from('categories').insert([{ name: categoryName }]);
      if (error) console.error('Error adding category:', error);
      else console.log('Category added successfully');
      setCategoryName('');
=======
"use client";

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { categories, setCategories, addCategory } = useAppContext();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch categories from Supabase');
      }

      if (!data) {
        throw new Error('No data returned from Supabase');
      }

      // Replace categories to avoid duplicates
      setCategories(data.map(category => ({ id: category.id, name: category.name })));
    } catch (err: any) {
      setFetchError(err.message || 'An unexpected error occurred while fetching categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setSubmitError('Category name cannot be empty');
      return;
    }

    // Check for duplicate category name locally
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setSubmitError('Category already exists');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: trimmedName })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Category name already exists in database');
        }
        throw new Error(error.message || 'Failed to add category to Supabase');
      }

      if (!data) {
        throw new Error('No data returned after adding category');
      }

      // Add the new category to context
      addCategory({ id: data.id, name: data.name });
      setCategoryName('');
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred while adding category');
      console.error('Add category error:', err);
    } finally {
      setLoading(false);
>>>>>>> backend setup
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Category</h2>
<<<<<<< HEAD
      
=======

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

>>>>>>> backend setup
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
<<<<<<< HEAD
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter category name"
=======
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            placeholder="Enter category name"
            disabled={loading}
>>>>>>> backend setup
          />
        </div>

        <button
          type="submit"
<<<<<<< HEAD
          className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
=======
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <Plus className="h-5 w-5" />
          <span>{loading ? 'Adding...' : 'Add Category'}</span>
>>>>>>> backend setup
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
<<<<<<< HEAD
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="font-medium">{category.name}</span>
            </div>
          ))}
        </div>
=======
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No categories found</div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        )}
>>>>>>> backend setup
      </div>
    </div>
  );
}