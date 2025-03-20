"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Sale, OrderItem, NewProduct } from '@/types';

interface Category {
  name: string;
}

interface AppContextType {
  products: OrderItem[];
  categories: Category[];
  sales: Sale[];
  addProduct: (product: NewProduct) => void;
  addCategory: (category: Category) => void;
  addSale: (sale: Sale) => void;
}

const defaultContext: AppContextType = {
  products: [],
  categories: [],
  sales: [],
  addProduct: () => {},
  addCategory: () => {},
  addSale: () => {}
};

const AppContext = createContext<AppContextType>(defaultContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<OrderItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addProduct = (product: NewProduct) => {
    const newProduct: OrderItem = {
      ...product,
      id: Date.now(),
      quantity: 0,
      discount: 0,
      subtotal: 0,
      totalAfterDiscount: 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
  };

  return (
    <AppContext.Provider value={{ products, categories, sales, addProduct, addCategory, addSale }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 