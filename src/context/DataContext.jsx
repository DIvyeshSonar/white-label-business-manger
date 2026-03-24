import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';

const DataContext = createContext();

const defaultStore = {
  businessInfo: {
    name: "",
    proprietor: "",
    phone: "",
    email: "",
    address: "",
    gst: "",
    logo: "",
    setupComplete: false
  },
  bankDetails: {
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: ""
  },
  bankQR: "",
  categories: [
    { id: 1, name: "General", description: "Default category", icon: "📦" },
    { id: 2, name: "Electronics", description: "Gadgets and devices", icon: "💻" },
    { id: 3, name: "Clothing & Apparel", description: "Clothes and accessories", icon: "👕" },
    { id: 4, name: "Food & Beverages", description: "Edibles and drinks", icon: "🍎" },
    { id: 5, name: "Home & Kitchen", description: "Household items", icon: "🏠" },
    { id: 6, name: "Health & Beauty", description: "Personal care", icon: "✨" },
    { id: 7, name: "Stationery", description: "Office and school supplies", icon: "✏️" },
    { id: 8, name: "Hardware & Tools", description: "Building and repair", icon: "🛠️" },
    { id: 9, name: "Automotive", description: "Vehicle parts and accessories", icon: "🚗" },
    { id: 10, name: "Beverages", description: "Drinks and sodas", icon: "🥤" },
    { id: 11, name: "Dairy & Eggs", description: "Milk, cheese, and eggs", icon: "🥚" },
    { id: 12, name: "Meat & Poultry", description: "Fresh meat products", icon: "🥩" },
    { id: 13, name: "Produce", description: "Fruits and vegetables", icon: "🥬" },
    { id: 14, name: "Bakery", description: "Bread and pastries", icon: "🥐" },
    { id: 15, name: "Frozen Foods", description: "Items kept in freezer", icon: "🧊" },
    { id: 16, name: "Pet Supplies", description: "Items for pets", icon: "🐕" },
    { id: 17, name: "Baby Care", description: "Items for infants", icon: "👶" },
    { id: 18, name: "Sports & Outdoors", description: "Equipment and gear", icon: "⚽" },
    { id: 19, name: "Toys & Games", description: "Fun things for all ages", icon: "🧸" },
    { id: 20, name: "Books & Media", description: "Knowledge and entertainment", icon: "📚" },
    { id: 21, name: "Jewelry & Accessories", description: "Fine jewelry and watches", icon: "💎" },
    { id: 22, name: "Furniture", description: "Tables, chairs, and beds", icon: "🛋️" },
    { id: 23, name: "Electrical Supplies", description: "Wires, bulbs, and switches", icon: "⚡" },
    { id: 24, name: "Plumbing", description: "Pipes, taps, and fittings", icon: "🚿" },
    { id: 25, name: "Footwear", description: "Shoes, boots, and sandals", icon: "👞" }
  ],
  products: [],
  suppliers: [],
  customers: [],
  transactions: [],
  counters: {
    products: 1,
    suppliers: 1,
    customers: 1,
    categories: 26,
    transactions: 1,
    invoicePurchase: 1,
    invoiceSale: 1
  }
};

export const DataProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [store, setStore] = useState(defaultStore);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Load data from Supabase when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setIsDbLoaded(false);
      supabase
        .from('user_data')
        .select('store_data')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            // PGRST116 = row not found (new user), other errors we log
            console.error('Failed to load data from Supabase:', error.message);
          }
          if (data && data.store_data) {
            setStore(data.store_data);
          } else {
            setStore(defaultStore);
          }
          setIsDbLoaded(true);
        });
    } else if (isLoaded && !isSignedIn) {
      setStore(defaultStore);
      setIsDbLoaded(false);
    }
  }, [user, isLoaded, isSignedIn]);

  // Save data to Supabase whenever store changes (after initial load)
  useEffect(() => {
    if (!isSignedIn || !user || !isDbLoaded) return;

    supabase
      .from('user_data')
      .upsert({ user_id: user.id, store_data: store, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to save data to Supabase:', error.message);
        }
      });
  }, [store, isSignedIn, user, isDbLoaded]);

  const updateBusinessInfo = (info) => {
    setStore(prev => ({ ...prev, businessInfo: { ...prev.businessInfo, ...info, setupComplete: true } }));
  };

  const updateBusinessLogo = (logo) => {
    setStore(prev => ({ ...prev, businessInfo: { ...prev.businessInfo, logo } }));
  };

  const updateBankDetails = (details) => {
    setStore(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ...details } }));
  };

  const updateBankQR = (bankQR) => {
    setStore(prev => ({ ...prev, bankQR }));
  };

  // Generic add function for standard entities
  const addEntity = (entityType, data, idCounterKey) => {
    const id = store.counters[idCounterKey];
    const newItem = { ...data, id, createdAt: new Date().toISOString() };
    
    // Initialize some specific fields based on entity
    if (entityType === 'products') {
      newItem.totalPurchased = newItem.currentStock || 0;
      newItem.totalSold = 0;
    } else if (entityType === 'suppliers' || entityType === 'customers') {
      newItem.totalPurchases = 0;
      newItem.lastPurchase = "";
    }

    setStore(prev => ({
      ...prev,
      [entityType]: [...prev[entityType], newItem],
      counters: { ...prev.counters, [idCounterKey]: prev.counters[idCounterKey] + 1 }
    }));
    
    return newItem;
  };

  const updateEntity = (entityType, id, updates) => {
    setStore(prev => ({
      ...prev,
      [entityType]: prev[entityType].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const deleteEntity = (entityType, id) => {
    setStore(prev => ({
      ...prev,
      [entityType]: prev[entityType].filter(item => item.id !== id)
    }));
  };

  // Transactions logic
  const addTransaction = (transaction) => {
    const isPurchase = transaction.type === 'purchase';
    const id = store.counters.transactions;
    const invoiceNumber = isPurchase 
      ? `PUR-${String(store.counters.invoicePurchase).padStart(3, '0')}`
      : `SAL-${String(store.counters.invoiceSale).padStart(3, '0')}`;
    
    const newTransaction = {
      ...transaction,
      id,
      invoiceNumber,
      createdAt: new Date().toISOString()
    };

    setStore(prev => {
      let updatedProducts = [...prev.products];
      let updatedSuppliers = [...prev.suppliers];
      let updatedCustomers = [...prev.customers];

      // Update Stock
      transaction.products.forEach(item => {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === item.productId) {
            const qty = item.quantity;
            if (isPurchase) {
              return { ...p, currentStock: p.currentStock + qty, totalPurchased: p.totalPurchased + qty };
            } else {
              return { ...p, currentStock: p.currentStock - qty, totalSold: p.totalSold + qty };
            }
          }
          return p;
        });
      });

      // Update Party
      if (isPurchase) {
        updatedSuppliers = updatedSuppliers.map(s => 
          s.id === transaction.partyId 
            ? { ...s, totalPurchases: s.totalPurchases + transaction.totalAmount, lastPurchase: transaction.date }
            : s
        );
      } else {
        updatedCustomers = updatedCustomers.map(c => 
          c.id === transaction.partyId 
            ? { ...c, totalPurchases: c.totalPurchases + transaction.totalAmount, lastPurchase: transaction.date }
            : c
        );
      }

      return {
        ...prev,
        transactions: [...prev.transactions, newTransaction],
        products: updatedProducts,
        suppliers: updatedSuppliers,
        customers: updatedCustomers,
        counters: {
          ...prev.counters,
          transactions: prev.counters.transactions + 1,
          invoicePurchase: isPurchase ? prev.counters.invoicePurchase + 1 : prev.counters.invoicePurchase,
          invoiceSale: !isPurchase ? prev.counters.invoiceSale + 1 : prev.counters.invoiceSale
        }
      };
    });

    return newTransaction;
  };

  const calculateMetrics = () => {
    const totalInventoryValue = store.products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
    const salesTransactions = store.transactions.filter(t => t.type === 'sale');
    const totalSalesRevenue = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPurchases = store.transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.totalAmount, 0);
    const totalProfit = totalSalesRevenue - totalPurchases;
    const lowStockItems = store.products.filter(p => p.currentStock <= p.reorderLevel).length;

    return {
      totalInventoryValue,
      totalSalesRevenue,
      totalProfit,
      lowStockItems,
      totalProducts: store.products.length,
      totalSuppliers: store.suppliers.length,
      totalCustomers: store.customers.length
    };
  };

  const contextValue = {
    store,
    isLoaded,
    isDbLoaded,
    updateBusinessInfo,
    updateBusinessLogo,
    updateBankDetails,
    updateBankQR,
    addEntity,
    updateEntity,
    deleteEntity,
    addTransaction,
    metrics: useMemo(() => calculateMetrics(), [store.products, store.transactions, store.suppliers, store.customers])
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
