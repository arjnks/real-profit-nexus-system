
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Customer, Product, Category, Service, Order, DailySales } from '@/types';
import * as supabaseService from '@/services/supabaseService';

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
  addOrder: (order: any) => Promise<string | null>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;

  // Daily sales data
  dailySales: DailySales[];
  setDailySales: React.Dispatch<React.SetStateAction<DailySales[]>>;

  // Leaderboard data
  leaderboard: any[];
  setLeaderboard: React.Dispatch<React.SetStateAction<any[]>>;
  leaderboardConfig: any | null;
  setLeaderboardConfig: React.Dispatch<React.SetStateAction<any | null>>;
  updateLeaderboardConfig: (config: Partial<any>) => Promise<boolean>;

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
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<any | null>(null);
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

      const newAccumulated = customer.accumulated_point_money + pointMoney;
      const newPoints = Math.floor(newAccumulated / 5);
      const remainingMoney = newAccumulated % 5;

      const success = await updateCustomer(customerId, {
        points: customer.points + newPoints,
        accumulated_point_money: remainingMoney
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
        joined_date: customerData.joined_date || new Date().toISOString(),
        total_spent: customerData.total_spent || 0,
        monthly_spent: customerData.monthly_spent || {},
        accumulated_point_money: customerData.accumulated_point_money || 0
      };

      console.log('DataContext: Adding customer with data:', fullCustomerData);
      const newCustomer = await supabaseService.addCustomer(fullCustomerData);
      if (newCustomer) {
        setCustomers(prev => [newCustomer, ...prev]);
        console.log('DataContext: Customer added successfully:', newCustomer.id);
        return newCustomer;
      }
      console.error('DataContext: Failed to add customer - no customer returned');
      return null;
    } catch (error) {
      console.error('DataContext: Error adding customer:', error);
      return null;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      console.log('DataContext: Updating customer:', id, customerData);
      const success = await supabaseService.updateCustomer(id, customerData);
      if (success) {
        setCustomers(prev => prev.map(customer => 
          customer.id === id ? { ...customer, ...customerData } : customer
        ));
        console.log('DataContext: Customer updated successfully');
        return true;
      }
      console.error('DataContext: Failed to update customer');
      return false;
    } catch (error) {
      console.error('DataContext: Error updating customer:', error);
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
  const addOrder = async (orderData: any) => {
    try {
      const orderWithDefaults = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customer_id: orderData.customer_id || '',
        customer_name: orderData.customer_name || '',
        customer_phone: orderData.customer_phone || '',
        customer_code: orderData.customer_code || '',
        products: orderData.products || [],
        total_amount: orderData.total_amount || 0,
        points_used: orderData.points_used || 0,
        amount_paid: orderData.amount_paid || orderData.total_amount || 0,
        points: orderData.points || 0,
        status: orderData.status || 'pending',
        payment_method: orderData.payment_method || 'cod',
        pincode: orderData.pincode || '',
        delivery_address: orderData.delivery_address || '',
        is_pending_approval: orderData.is_pending_approval !== undefined ? orderData.is_pending_approval : true,
        is_points_awarded: orderData.is_points_awarded || false,
        delivery_approved: orderData.delivery_approved || false,
        points_approved: orderData.points_approved || false,
        order_date: new Date().toISOString()
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
      console.log('DataContext: Updating order:', id, orderData);
      const success = await supabaseService.updateOrder(id, orderData);
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === id ? { ...order, ...orderData } : order
        ));
        console.log('DataContext: Order updated successfully');
        return true;
      }
      console.error('DataContext: Failed to update order');
      return false;
    } catch (error) {
      console.error('DataContext: Error updating order:', error);
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
  const updateLeaderboardConfig = async (configData: Partial<any>) => {
    try {
      await supabaseService.updateLeaderboardConfig(configData);
      setLeaderboardConfig(prev => prev ? { ...prev, ...configData } : null);
      return true;
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
