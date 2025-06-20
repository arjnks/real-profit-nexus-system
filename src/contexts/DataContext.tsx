
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import type { Customer, Product, Category, Service, Order, DailySales, LeaderboardConfig, LeaderboardEntry } from '@/types';

interface DataContextType {
  // Customer data
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer | null>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;

  // Product data
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Category data
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Service data
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addService: (service: Omit<Service, 'id'>) => Promise<Service | null>;
  updateService: (id: string, service: Partial<Service>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  // Order data
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, 'orderDate'>) => Promise<string | null>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // Daily sales data
  dailySales: DailySales[];
  setDailySales: React.Dispatch<React.SetStateAction<DailySales[]>>;

  // Leaderboard data
  leaderboard: LeaderboardEntry[];
  setLeaderboard: React.Dispatch<React.SetStateAction<LeaderboardEntry[]>>;
  leaderboardConfig: LeaderboardConfig | null;
  setLeaderboardConfig: React.Dispatch<React.SetStateAction<LeaderboardConfig | null>>;
  updateLeaderboardConfig: (config: Partial<LeaderboardConfig>) => Promise<boolean>;

  // Loading and refresh
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      console.log('DataContext: Starting data refresh...');

      const [
        customersData,
        productsData,
        categoriesData,
        servicesData,
        ordersData,
        dailySalesData,
        leaderboardData,
        leaderboardConfigData
      ] = await Promise.allSettled([
        supabaseService.getCustomers(),
        supabaseService.getProducts(),
        supabaseService.getCategories(),
        supabaseService.getServices(),
        supabaseService.getOrders(),
        supabaseService.getDailySales(),
        supabaseService.getLeaderboard(),
        supabaseService.getLeaderboardConfig()
      ]);

      if (customersData.status === 'fulfilled') {
        setCustomers(customersData.value);
        console.log('DataContext: Customers loaded:', customersData.value.length);
      } else {
        console.error('DataContext: Failed to load customers:', customersData.reason);
      }

      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value);
        console.log('DataContext: Products loaded:', productsData.value.length);
      } else {
        console.error('DataContext: Failed to load products:', productsData.reason);
      }

      if (categoriesData.status === 'fulfilled') {
        setCategories(categoriesData.value);
        console.log('DataContext: Categories loaded:', categoriesData.value.length);
      } else {
        console.error('DataContext: Failed to load categories:', categoriesData.reason);
      }

      if (servicesData.status === 'fulfilled') {
        setServices(servicesData.value);
        console.log('DataContext: Services loaded:', servicesData.value.length);
      } else {
        console.error('DataContext: Failed to load services:', servicesData.reason);
      }

      if (ordersData.status === 'fulfilled') {
        setOrders(ordersData.value);
        console.log('DataContext: Orders loaded:', ordersData.value.length);
      } else {
        console.error('DataContext: Failed to load orders:', ordersData.reason);
      }

      if (dailySalesData.status === 'fulfilled') {
        setDailySales(dailySalesData.value);
        console.log('DataContext: Daily sales loaded:', dailySalesData.value.length);
      } else {
        console.error('DataContext: Failed to load daily sales:', dailySalesData.reason);
      }

      if (leaderboardData.status === 'fulfilled') {
        setLeaderboard(leaderboardData.value);
        console.log('DataContext: Leaderboard loaded:', leaderboardData.value.length);
      } else {
        console.error('DataContext: Failed to load leaderboard:', leaderboardData.reason);
      }

      if (leaderboardConfigData.status === 'fulfilled') {
        setLeaderboardConfig(leaderboardConfigData.value);
        console.log('DataContext: Leaderboard config loaded');
      } else {
        console.error('DataContext: Failed to load leaderboard config:', leaderboardConfigData.reason);
      }

    } catch (error) {
      console.error('DataContext: Error during data refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Customer operations
  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await supabaseService.addCustomer(customerData);
      if (newCustomer) {
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
      }
      return null;
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const success = await supabaseService.updateCustomer(id, customerData);
      if (success) {
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? { ...customer, ...customerData } : customer
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating customer:', error);
      return false;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const success = await supabaseService.deleteCustomer(id);
      if (success) {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  };

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await supabaseService.addProduct(productData);
      if (newProduct) {
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
      return null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const success = await supabaseService.updateProduct(id, productData);
      if (success) {
        setProducts(prev => prev.map(product => 
          product.id === id ? { ...product, ...productData } : product
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await supabaseService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  // Category operations
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = await supabaseService.addCategory(categoryData);
      if (newCategory) {
        setCategories(prev => [newCategory, ...prev]);
        return newCategory;
      }
      return null;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const success = await supabaseService.updateCategory(id, categoryData);
      if (success) {
        setCategories(prev => prev.map(category => 
          category.id === id ? { ...category, ...categoryData } : category
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const success = await supabaseService.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };

  // Service operations
  const addService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const newService = await supabaseService.addService(serviceData);
      if (newService) {
        setServices(prev => [newService, ...prev]);
        return newService;
      }
      return null;
    } catch (error) {
      console.error('Error adding service:', error);
      return null;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const success = await supabaseService.updateService(id, serviceData);
      if (success) {
        setServices(prev => prev.map(service => 
          service.id === id ? { ...service, ...serviceData } : service
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating service:', error);
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const success = await supabaseService.deleteService(id);
      if (success) {
        setServices(prev => prev.filter(service => service.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting service:', error);
      return false;
    }
  };

  // Order operations
  const addOrder = async (orderData: Omit<Order, 'orderDate'>) => {
    try {
      const orderWithDate = {
        ...orderData,
        order_date: new Date().toISOString()
      };
      
      console.log('DataContext: Adding order with data:', orderWithDate);
      const newOrder = await supabaseService.addOrder(orderWithDate);
      
      if (newOrder) {
        setOrders(prev => [newOrder, ...prev]);
        console.log('DataContext: Order added successfully:', newOrder.id);
        return newOrder.id;
      }
      console.error('DataContext: Failed to add order - no order returned');
      return null;
    } catch (error) {
      console.error('DataContext: Error adding order:', error);
      return null;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      const success = await supabaseService.updateOrder(id, orderData);
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === id ? { ...order, ...orderData } : order
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const success = await supabaseService.deleteOrder(id);
      if (success) {
        setOrders(prev => prev.filter(order => order.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  };

  // Leaderboard operations
  const updateLeaderboardConfig = async (configData: Partial<LeaderboardConfig>) => {
    try {
      const success = await supabaseService.updateLeaderboardConfig(configData);
      if (success) {
        setLeaderboardConfig(prev => prev ? { ...prev, ...configData } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating leaderboard config:', error);
      return false;
    }
  };

  const value: DataContextType = {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    services,
    setServices,
    addService,
    updateService,
    deleteService,
    orders,
    setOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    dailySales,
    setDailySales,
    leaderboard,
    setLeaderboard,
    leaderboardConfig,
    setLeaderboardConfig,
    updateLeaderboardConfig,
    isLoading,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
