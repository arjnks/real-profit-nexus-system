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
  getNextAvailableCode: () => string;

  // Product data
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  calculatePointsForProduct: (mrp: number, price: number) => number;

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
  addOrder: (order: Partial<Order>) => Promise<string | null>;
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

  // Points and rewards
  awardPoints: (customerId: string, pointMoney: number) => Promise<boolean>;

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

  // Get next available customer code
  const getNextAvailableCode = () => {
    const existingCodes = customers.map(c => c.code).filter(Boolean);
    let nextNumber = 101; // Start from A101
    
    while (existingCodes.includes(`A${nextNumber}`)) {
      nextNumber++;
    }
    
    return `A${nextNumber}`;
  };

  // Add calculatePointsForProduct function
  const calculatePointsForProduct = (mrp: number, price: number) => {
    const profit = mrp - price;
    return Math.floor(profit * 0.1); // 10% of profit as point money
  };

  // Add awardPoints function
  const awardPoints = async (customerId: string, pointMoney: number) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return false;

      const newAccumulated = customer.accumulatedPointMoney + pointMoney;
      const newPoints = Math.floor(newAccumulated / 5);
      const remainingMoney = newAccumulated % 5;

      const success = await updateCustomer(customerId, {
        points: customer.points + newPoints,
        accumulatedPointMoney: remainingMoney
      });

      return success;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  // Customer operations
  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const fullCustomerData = {
        ...customerData,
        points: customerData.points || 0,
        tier: customerData.tier || 'Bronze',
        joinedDate: customerData.joinedDate || new Date().toISOString(),
        totalSpent: customerData.totalSpent || 0,
        monthlySpent: customerData.monthlySpent || {},
        accumulatedPointMoney: customerData.accumulatedPointMoney || 0
      };

      const newCustomer = await supabaseService.addCustomer(fullCustomerData);
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
      const fullCategoryData = {
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newCategory = await supabaseService.addCategory(fullCategoryData);
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
  const addOrder = async (orderData: Partial<Order>) => {
    try {
      const orderWithDefaults = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: orderData.customerId || '',
        customerName: orderData.customerName || '',
        customerPhone: orderData.customerPhone || '',
        customerCode: orderData.customerCode || '',
        products: orderData.products || [],
        totalAmount: orderData.totalAmount || 0,
        pointsUsed: orderData.pointsUsed || 0,
        amountPaid: orderData.amountPaid || 0,
        points: orderData.points || 0,
        status: orderData.status || 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        pincode: orderData.pincode || '',
        deliveryAddress: orderData.deliveryAddress || '',
        isPendingApproval: orderData.isPendingApproval || true,
        isPointsAwarded: orderData.isPointsAwarded || false,
        deliveryApproved: orderData.deliveryApproved || false,
        pointsApproved: orderData.pointsApproved || false,
        orderDate: new Date().toISOString()
      };
      
      console.log('DataContext: Adding order with data:', orderWithDefaults);
      const newOrder = await supabaseService.addOrder(orderWithDefaults);
      
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
    getNextAvailableCode,
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    calculatePointsForProduct,
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
    awardPoints,
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
