import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseService } from '@/services/supabaseService';
import type { Customer, Product, Category, Service, Order } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  customers: Customer[];
  categories: Category[];
  products: Product[];
  services: Service[];
  orders: Order[];
  offers: any[];
  isLoading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting data refresh...');
      
      // Fetch all data concurrently but handle errors individually
      const [
        fetchedCustomers,
        fetchedCategories, 
        fetchedProducts,
        fetchedServices,
        fetchedOrders
      ] = await Promise.allSettled([
        supabaseService.getCustomers().catch(err => {
          console.error('Failed to fetch customers:', err);
          return [];
        }),
        supabaseService.getCategories().catch(err => {
          console.error('Failed to fetch categories:', err);
          return [];
        }),
        supabaseService.getProducts().catch(err => {
          console.error('Failed to fetch products:', err);
          return [];
        }),
        supabaseService.getServices().catch(err => {
          console.error('Failed to fetch services:', err);
          return [];
        }),
        supabaseService.getOrders().catch(err => {
          console.error('Failed to fetch orders:', err);
          return [];
        })
      ]);

      // Set data based on results
      if (fetchedCustomers.status === 'fulfilled' && Array.isArray(fetchedCustomers.value)) {
        setCustomers(fetchedCustomers.value);
        console.log(`Loaded ${fetchedCustomers.value.length} customers`);
      } else {
        console.warn('Failed to load customers:', fetchedCustomers);
        setCustomers([]);
      }
      
      if (fetchedCategories.status === 'fulfilled' && Array.isArray(fetchedCategories.value)) {
        setCategories(fetchedCategories.value);
        console.log(`Loaded ${fetchedCategories.value.length} categories`);
      } else {
        console.warn('Failed to load categories:', fetchedCategories);
        setCategories([]);
      }
      
      if (fetchedProducts.status === 'fulfilled' && Array.isArray(fetchedProducts.value)) {
        setProducts(fetchedProducts.value);
        console.log(`Loaded ${fetchedProducts.value.length} products`);
      } else {
        console.warn('Failed to load products:', fetchedProducts);
        setProducts([]);
      }
      
      if (fetchedServices.status === 'fulfilled' && Array.isArray(fetchedServices.value)) {
        setServices(fetchedServices.value);
        console.log(`Loaded ${fetchedServices.value.length} services`);
      } else {
        console.warn('Failed to load services:', fetchedServices);
        setServices([]);
      }
      
      if (fetchedOrders.status === 'fulfilled' && Array.isArray(fetchedOrders.value)) {
        setOrders(fetchedOrders.value);
        console.log(`Loaded ${fetchedOrders.value.length} orders`);
      } else {
        console.warn('Failed to load orders:', fetchedOrders);
        setOrders([]);
      }

      // Check if any critical data failed to load
      const failedRequests = [
        fetchedCustomers,
        fetchedCategories,
        fetchedProducts,
        fetchedServices,
        fetchedOrders
      ].filter(result => result.status === 'rejected');

      if (failedRequests.length > 0) {
        console.warn(`${failedRequests.length} requests failed during data refresh`);
        // Don't set error state unless all requests failed
        if (failedRequests.length === 5) {
          setError(`Failed to load data. Please try refreshing the page.`);
        }
      }

      console.log('Data refresh completed successfully');
    } catch (error) {
      console.error("Critical error during data refresh:", error);
      setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to load data. Please refresh the page.');
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
        toast.success('Customer added successfully');
        return newCustomer.id;
      }
      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(`Failed to add customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Customer updated successfully');
        return true;
      }
      throw new Error('Failed to update customer');
    } catch (error) {
      console.error(`Error updating customer with id ${id}:`, error);
      toast.error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteCustomer(id);
      if (success) {
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        toast.success('Customer deleted successfully');
        return true;
      }
      throw new Error('Failed to delete customer');
    } catch (error) {
      console.error(`Error deleting customer with id ${id}:`, error);
      toast.error(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> => {
    try {
      const newCategory = await supabaseService.addCategory(categoryData);
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category added successfully');
        return newCategory;
      }
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(`Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Category updated successfully');
        return true;
      }
      throw new Error('Failed to update category');
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      toast.error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        toast.success('Category deleted successfully');
        return true;
      }
      throw new Error('Failed to delete category');
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      toast.error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const newProduct = await supabaseService.addProduct(productData);
      if (newProduct) {
        setProducts(prev => [...prev, newProduct]);
        toast.success('Product added successfully');
        return newProduct;
      }
      throw new Error('Failed to create product');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Product updated successfully');
        return true;
      }
      throw new Error('Failed to update product');
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      toast.error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id));
        toast.success('Product deleted successfully');
        return true;
      }
      throw new Error('Failed to delete product');
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      toast.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service | null> => {
    try {
      const newService = await supabaseService.addService(serviceData);
      if (newService) {
        setServices(prev => [...prev, newService]);
        toast.success('Service added successfully');
        return newService;
      }
      throw new Error('Failed to create service');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error(`Failed to add service: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Service updated successfully');
        return true;
      }
      throw new Error('Failed to update service');
    } catch (error) {
      console.error(`Error updating service with id ${id}:`, error);
      toast.error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteService(id);
      if (success) {
        setServices(prev => prev.filter(service => service.id !== id));
        toast.success('Service deleted successfully');
        return true;
      }
      throw new Error('Failed to delete service');
    } catch (error) {
      console.error(`Error deleting service with id ${id}:`, error);
      toast.error(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string | null> => {
    try {
      const newOrder = await supabaseService.addOrder(orderData);
      if (newOrder) {
        setOrders(prev => [...prev, newOrder]);
        toast.success('Order created successfully');
        return newOrder.id;
      }
      throw new Error('Failed to create order');
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        toast.success('Order updated successfully');
        return true;
      }
      throw new Error('Failed to update order');
    } catch (error) {
      console.error(`Error updating order with id ${id}:`, error);
      toast.error(`Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const awardPoints = async (customerId: string, points: number): Promise<boolean> => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error(`Customer with id ${customerId} not found`);
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
        toast.success(`Points awarded successfully to ${customer.name}`);
        return true;
      }
      throw new Error('Failed to award points');
    } catch (error) {
      console.error(`Error awarding points to customer with id ${customerId}:`, error);
      toast.error(`Failed to award points: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        error,
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
