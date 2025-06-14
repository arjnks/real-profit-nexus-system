import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService } from '@/services/supabaseService';
import type { Customer, Product, Category, Service, Order } from '@/types';

interface DataContextType {
  customers: Customer[];
  categories: Category[];
  products: Product[];
  services: Service[];
  orders: Order[];
  offers: any[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'points' | 'tier' | 'joinedDate' | 'miniCoins' | 'totalSpent' | 'monthlySpent' | 'accumulatedPointMoney'>) => Promise<string | null>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  addCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category | null>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addService: (serviceData: Omit<Service, 'id'>) => Promise<Service | null>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  addOrder: (orderData: Omit<Order, 'id' | 'orderDate'>) => Promise<string | null>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<boolean>;
  awardPoints: (customerId: string, points: number) => Promise<boolean>;
  isAdmin: (customerCode?: string) => boolean;
  calculatePointsForProduct: (mrp: number, price: number) => number;
  getNextAvailableCode: () => string;
  getDownlineStructure: (customerCode: string) => any;
  getMLMStatistics: () => any;
  getMLMCommissionStructure: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const fetchedCustomers = await supabaseService.getCustomers();
      setCustomers(fetchedCustomers);

      const fetchedCategories = await supabaseService.getCategories();
      setCategories(fetchedCategories);

      const fetchedProducts = await supabaseService.getProducts();
      setProducts(fetchedProducts);

      const fetchedServices = await supabaseService.getServices();
      setServices(fetchedServices);

      const fetchedOrders = await supabaseService.getOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'points' | 'tier' | 'joinedDate' | 'miniCoins' | 'totalSpent' | 'monthlySpent' | 'accumulatedPointMoney'>) => {
    try {
      const newCustomer = await supabaseService.addCustomer({
        ...customerData,
        address: customerData.address || ''
      });
      
      if (newCustomer) {
        setCustomers(prev => [...prev, newCustomer]);
        return newCustomer.id;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateCustomer(id, customerData);
      if (success) {
        setCustomers(prev =>
          prev.map(customer =>
            customer.id === id ? { ...customer, ...customerData } : customer
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating customer with id ${id}:`, error);
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteCustomer(id);
      if (success) {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting customer with id ${id}:`, error);
      return false;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> => {
    try {
      const newCategory = await supabaseService.addCategory(categoryData);
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      }
      return null;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateCategory(id, categoryData);
      if (success) {
        setCategories(prev =>
          prev.map(category =>
            category.id === id ? { ...category, ...categoryData } : category
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      return false;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const newProduct = await supabaseService.addProduct(productData);
      if (newProduct) {
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      }
      return null;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateProduct(id, productData);
      if (success) {
        setProducts(prev =>
          prev.map(product =>
            product.id === id ? { ...product, ...productData } : product
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      return false;
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service | null> => {
    try {
      const newService = await supabaseService.addService(serviceData);
      if (newService) {
        setServices(prev => [...prev, newService]);
        return newService;
      }
      return null;
    } catch (error) {
      console.error('Error adding service:', error);
      return null;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateService(id, serviceData);
      if (success) {
        setServices(prev =>
          prev.map(service =>
            service.id === id ? { ...service, ...serviceData } : service
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating service with id ${id}:`, error);
      return false;
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteService(id);
      if (success) {
        setServices(prev => prev.filter(service => service.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting service with id ${id}:`, error);
      return false;
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> => {
    try {
      const newOrder = await supabaseService.addOrder(orderData);
      if (newOrder) {
        setOrders(prev => [...prev, newOrder]);
        return newOrder.id;
      }
      return null;
    } catch (error) {
      console.error('Error adding order:', error);
      return null;
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Order>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateOrder(id, orderData);
      if (success) {
        setOrders(prev =>
          prev.map(order =>
            order.id === id ? { ...order, ...orderData } : order
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error updating order with id ${id}:`, error);
      return false;
    }
  };

  const awardPoints = async (customerId: string, points: number): Promise<boolean> => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        console.error(`Customer with id ${customerId} not found`);
        return false;
      }

      const accumulatedPointMoney = customer.accumulatedPointMoney + points;
      
      const newPoints = Math.floor(accumulatedPointMoney / 5);
      const remainingMoney = accumulatedPointMoney % 5;

      const updateData: Partial<Customer> = {
        points: customer.points + newPoints,
        accumulatedPointMoney: remainingMoney
      };

      if (updateData.points !== undefined) {
        if (updateData.points >= 160) {
          updateData.tier = 'Diamond';
        } else if (updateData.points >= 80) {
          updateData.tier = 'Gold';
        } else if (updateData.points >= 40) {
          updateData.tier = 'Silver';
        } else {
          updateData.tier = 'Bronze';
        }
      }

      const success = await supabaseService.updateCustomer(customerId, updateData);
      if (success) {
        setCustomers(prev =>
          prev.map(c =>
            c.id === customerId ? { ...c, ...updateData } : c
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error awarding points to customer with id ${customerId}:`, error);
      return false;
    }
  };

  const isAdmin = (customerCode?: string) => {
    if (customerCode) {
      return customerCode === 'A100' || customerCode.startsWith('A');
    }
    return true;
  };

  const calculatePointsForProduct = (mrp: number, price: number): number => {
    // Calculate point money as the difference between MRP and selling price
    const pointMoney = mrp - price;
    return Math.max(0, pointMoney);
  };

  const getNextAvailableCode = (): string => {
    const existingCodes = customers.map(c => c.code);
    let counter = 1;
    
    while (existingCodes.includes(`C${counter.toString().padStart(3, '0')}`)) {
      counter++;
    }
    
    return `C${counter.toString().padStart(3, '0')}`;
  };

  const getDownlineStructure = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return null;

    const buildDownline = (code: string): any => {
      const current = customers.find(c => c.code === code);
      if (!current) return null;

      const children = customers
        .filter(c => c.parentCode === code)
        .map(child => buildDownline(child.code))
        .filter(Boolean);

      return {
        customer: current,
        children
      };
    };

    return buildDownline(customerCode);
  };

  const getMLMStatistics = () => {
    return {
      totalCustomers: customers.length,
      totalCommissions: customers.reduce((sum, c) => sum + c.totalCommissions, 0),
      activeCustomers: customers.filter(c => c.totalSpent > 0).length
    };
  };

  const getMLMCommissionStructure = () => {
    return {
      level1: 0.05,
      level2: 0.025,
      level3: 0.0167
    };
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        categories,
        products,
        services,
        orders,
        offers,
        isLoading,
        refreshData,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addService,
        updateService,
        deleteService,
        addOrder,
        updateOrder,
        awardPoints,
        isAdmin,
        calculatePointsForProduct,
        getNextAvailableCode,
        getDownlineStructure,
        getMLMStatistics,
        getMLMCommissionStructure
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Export Product type for useCart
export type { Product };
