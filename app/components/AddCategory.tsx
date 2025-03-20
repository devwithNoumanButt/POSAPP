import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function AddCategory() {
  const [categoryName, setCategoryName] = useState('');
  const { categories, addCategory } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName) {
      addCategory({ name: categoryName });
      setCategoryName('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Category</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter category name"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>
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
      </div>
    </div>
  );
}