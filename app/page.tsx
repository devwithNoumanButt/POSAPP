"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  FolderPlus, 
  PackagePlus, 
  ShoppingCart, 
  ClipboardList,
  Sparkles
} from 'lucide-react';
import Statistics from './components/Statistics';
import AddCategory from './components/AddCategory';
import AddProduct from './components/AddProduct';
import POS from './components/POS';
import OrderDetails from './components/OrderDetails';

export default function Home() {
  const [activeTab, setActiveTab] = useState('statistics');

  const tabs = [
    { id: 'statistics', name: 'Statistics', icon: BarChart3 },
    { id: 'addCategory', name: 'Add Category', icon: FolderPlus },
    { id: 'addProduct', name: 'Add Product', icon: PackagePlus },
    { id: 'pos', name: 'POS', icon: ShoppingCart },
    { id: 'orderDetails', name: 'Order Details', icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <Statistics />;
      case 'addCategory':
        return <AddCategory />;
      case 'addProduct':
        return <AddProduct />;
      case 'pos':
        return <POS />;
      case 'orderDetails':
        return <OrderDetails />;
      default:
        return <Statistics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Fashion Kids POS</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-500 animate-fadeIn">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
