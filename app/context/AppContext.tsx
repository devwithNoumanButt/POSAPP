"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
  name: string;
  category: string;
  price: number;
  code: string;
  description: string;
  quantity?: number;
  discount?: number;
  totalAfterDiscount?: number;
}

interface Category {
  name: string;
}

interface Sale {
  id: string;
  items: Product[];
  total: number;
  date: string;
  customerName?: string;
  phoneNumber?: string;
  tenderedAmount?: number;
  change?: number;
}

interface AppContextType {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  addProduct: (product: Product) => void;
  addCategory: (category: Category) => void;
  addSale: (sale: Sale) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const addSale = (sale: Sale) => {
    setSales((prev) => [...prev, sale]);
  };

  return (
    <AppContext.Provider value={{ products, categories, sales, addProduct, addCategory, addSale }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 