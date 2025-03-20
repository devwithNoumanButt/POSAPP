"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
<<<<<<< HEAD
=======
  id?: number; // Added optional id for Supabase integration
>>>>>>> backend setup
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
<<<<<<< HEAD
=======
  id?: number; // Added optional id for Supabase integration
>>>>>>> backend setup
  name: string;
}

interface Sale {
<<<<<<< HEAD
  id: string;
=======
  id: string | number; // Allow number for Supabase id
>>>>>>> backend setup
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
<<<<<<< HEAD
  categories: Category[];
  sales: Sale[];
=======
  setProducts: (products: Product[]) => void; // Added
  categories: Category[];
  setCategories: (categories: Category[]) => void; // Added
  sales: Sale[];
  setSales: (sales: Sale[]) => void; // Added
>>>>>>> backend setup
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
<<<<<<< HEAD
    <AppContext.Provider value={{ products, categories, sales, addProduct, addCategory, addSale }}>
=======
    <AppContext.Provider
      value={{
        products,
        setProducts, // Added
        categories,
        setCategories, // Added
        sales,
        setSales, // Added
        addProduct,
        addCategory,
        addSale,
      }}
    >
>>>>>>> backend setup
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
<<<<<<< HEAD
}; 
=======
};
>>>>>>> backend setup
