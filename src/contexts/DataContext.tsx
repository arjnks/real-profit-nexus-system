import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseService } from '@/services/supabaseService';

// Types
export type Customer = {
  id: string;
  name: string;
  phone: string;
  code: string;
  points: number;
  miniCoins: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  parentCode: string | null;
  joinedDate: string;
  isReserved: boolean;
  isPending: boolean;
  totalSpent: number;
  monthlySpent: Record<string, number>;
  accumulatedPointMoney: number;
  lastMLMDistribution?: string;
  passwordHash?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  dummyPrice?: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  tierDiscounts: {
    Bronze: number;
    Silver: number;
    Gold: number;
    Diamond: number;
  };
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  isActive: boolean;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCode?: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  pointsUsed: number;
  amountPaid: number;
  points: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentMethod: "cod" | "upi";
  pincode: string;
  orderDate: string;
  isPendingApproval: boolean;
  isPointsAwarded: boolean;
  deliveryApproved: boolean;
  pointsApproved: boolean;
  usedPointsDiscount?: boolean;
  mlmDistributionLog?: string[];
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  minTier: "Bronze" | "Silver" | "Gold" | "Diamond";
  discountPercentage: number;
  validUntil: string;
  image: string;
};

interface DataContextType {
  customers: Customer[];
  products: Product[];
  services: Service[];
  orders: Order[];
  offers: Offer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">) => Promise<Customer | null>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => Promise<string>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  getNextAvailableCode: () => string;
  awardPoints: (customerId: string, pointMoney: number, orderId?: string) => void;
  reserveCode: (code: string, name: string, phone: string) => void;
  calculateTierBenefits: (tier: string) => number;
  calculatePointsForProduct: (mrp: number, sellingPrice: number) => number;
  moveCustomerInMLM: (customerId: string, newParentCode: string | null) => void;
  getMLMPath: (customerCode: string) => string[];
  refreshData: () => Promise<void>;
  updateProductStock: (productId: string, quantityPurchased: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading data from Supabase...');
      
      const [customersData, productsData, servicesData, ordersData] = await Promise.all([
        supabaseService.getCustomers(),
        supabaseService.getProducts(),
        supabaseService.getServices(),
        supabaseService.getOrders(),
      ]);

      console.log('Data loaded:', { 
        customers: customersData.length, 
        products: productsData.length, 
        services: servicesData.length,
        orders: ordersData.length
      });

      setCustomers(customersData);
      setProducts(productsData);
      setServices(servicesData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  // Calculate point money based on MRP vs Selling Price difference
  const calculatePointsForProduct = (mrp: number, sellingPrice: number): number => {
    const difference = mrp - sellingPrice;
    return Math.max(0, Math.floor(difference));
  };

  // Update product stock after purchase
  const updateProductStock = async (productId: string, quantityPurchased: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStockQuantity = Math.max(0, product.stockQuantity - quantityPurchased);
    const success = await supabaseService.updateProduct(productId, {
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0
    });

    if (success) {
      setProducts(prev =>
        prev.map(p =>
          p.id === productId
            ? { ...p, stockQuantity: newStockQuantity, inStock: newStockQuantity > 0 }
            : p
        )
      );
    }
  };

  // Get MLM path (5 levels up from a customer)
  const getMLMPath = (customerCode: string): string[] => {
    const path: string[] = [];
    let currentCode = customerCode;
    
    for (let level = 0; level < 5; level++) {
      const customer = customers.find(c => c.code === currentCode);
      if (!customer || !customer.parentCode) break;
      
      path.push(customer.parentCode);
      currentCode = customer.parentCode;
    }
    
    return path;
  };

  // Move customer in MLM structure
  const moveCustomerInMLM = async (customerId: string, newParentCode: string | null) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const success = await supabaseService.updateCustomer(customerId, {
      parentCode: newParentCode === 'A100' ? null : newParentCode
    });

    if (success) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === customerId
            ? { ...c, parentCode: newParentCode === 'A100' ? null : newParentCode }
            : c
        )
      );
    }
  };

  // Get next available sequential code
  const getNextAvailableCode = (): string => {
    const activeCodes = customers
      .filter(c => c.code.startsWith('A'))
      .map(c => parseInt(c.code.substring(1)))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    let nextNumber = 101;
    for (const num of activeCodes) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    return `A${nextNumber}`;
  };

  // Calculate tier based on points
  const calculateTier = (points: number): Customer['tier'] => {
    if (points >= 160) return 'Diamond';
    if (points >= 80) return 'Gold';
    if (points >= 40) return 'Silver';
    if (points >= 12) return 'Bronze'; // Changed from 20 to 12
    return 'Bronze';
  };

  // Calculate tier benefits (point discount for products)
  const calculateTierBenefits = (tier: string): number => {
    switch (tier) {
      case 'Diamond': return 5;
      case 'Gold': return 4;
      case 'Silver': return 3;
      case 'Bronze': return 2;
      default: return 2;
    }
  };

  // Enhanced award points function with MLM tracking
  const awardPoints = (customerId: string, pointMoney: number, orderId?: string) => {
    console.log(`Awarding ${pointMoney} point money to customer ${customerId} for order ${orderId}`);
    
    setCustomers(prev => {
      const newCustomers = prev.map(customer => ({ ...customer }));
      const customerIndex = newCustomers.findIndex(c => c.id === customerId);
      
      if (customerIndex === -1) {
        console.log(`Customer ${customerId} not found`);
        return prev;
      }
      
      const customer = newCustomers[customerIndex];
      const newAccumulated = customer.accumulatedPointMoney + pointMoney;
      const newPoints = Math.floor(newAccumulated / 5);
      const remainingMoney = newAccumulated % 5;
      
      console.log(`Customer ${customer.code}: ${newAccumulated} accumulated, awarding ${newPoints} points, ${remainingMoney} remaining`);
      
      // Update customer with new points and remaining accumulated money
      const updatedCustomer = {
        ...customer,
        points: customer.points + newPoints,
        accumulatedPointMoney: remainingMoney,
        tier: calculateTier(customer.points + newPoints),
        lastMLMDistribution: orderId ? new Date().toISOString() : customer.lastMLMDistribution
      };

      newCustomers[customerIndex] = updatedCustomer;

      // Update in database
      supabaseService.updateCustomer(customerId, updatedCustomer);
      
      // Distribute mini coins to MLM network
      if (newPoints > 0) {
        const mlmPath = getMLMPath(customer.code);
        
        mlmPath.forEach((parentCode, level) => {
          const parentIndex = newCustomers.findIndex(c => c.code === parentCode);
          if (parentIndex !== -1) {
            const miniCoinsToAdd = newPoints;
            
            const updatedParent = {
              ...newCustomers[parentIndex],
              miniCoins: newCustomers[parentIndex].miniCoins + miniCoinsToAdd,
              lastMLMDistribution: new Date().toISOString()
            };

            // Convert mini coins to points (5 mini coins = 1 point)
            if (updatedParent.miniCoins >= 5) {
              const parentNewPoints = Math.floor(updatedParent.miniCoins / 5);
              updatedParent.points = updatedParent.points + parentNewPoints;
              updatedParent.miniCoins = updatedParent.miniCoins % 5;
              updatedParent.tier = calculateTier(updatedParent.points);
              
              console.log(`Parent ${parentCode} at level ${level + 1} received ${miniCoinsToAdd} mini coins, converted ${parentNewPoints} points`);
            }

            newCustomers[parentIndex] = updatedParent;
            // Update in database
            supabaseService.updateCustomer(updatedParent.id, updatedParent);
          }
        });
      }
      
      return newCustomers;
    });
  };

  // Add a new customer
  const addCustomer = async (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">): Promise<Customer | null> => {
    console.log('Adding customer:', customer);
    const newCustomer = await supabaseService.addCustomer(customer);
    
    if (newCustomer) {
      setCustomers(prev => [...prev, newCustomer]);
      console.log('Customer added successfully');
      return newCustomer;
    }
    return null;
  };

  // Update an existing customer
  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    const success = await supabaseService.updateCustomer(id, customerData);
    
    if (success) {
      setCustomers(prev =>
        prev.map(customer => {
          if (customer.id === id) {
            const updated = { ...customer, ...customerData };
            if (customerData.points !== undefined) {
              updated.tier = calculateTier(updated.points);
            }
            return updated;
          }
          return customer;
        })
      );
    }
  };

  // Delete a customer
  const deleteCustomer = async (id: string) => {
    const success = await supabaseService.deleteCustomer(id);
    
    if (success) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  // Reserve a code
  const reserveCode = async (code: string, name: string, phone: string) => {
    await addCustomer({
      name,
      phone,
      code,
      parentCode: null,
      isReserved: true,
      isPending: false,
    });
  };

  // Add a new product
  const addProduct = async (product: Omit<Product, "id">) => {
    console.log('Adding product:', product);
    const newProduct = await supabaseService.addProduct(product);
    
    if (newProduct) {
      setProducts(prev => [...prev, newProduct]);
      console.log('Product added successfully');
    }
  };

  // Update an existing product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const success = await supabaseService.updateProduct(id, productData);
    
    if (success) {
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...productData } : product
        )
      );
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    const success = await supabaseService.deleteProduct(id);
    
    if (success) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };

  // Add a new service
  const addService = async (service: Omit<Service, "id">) => {
    console.log('Adding service:', service);
    const newService = await supabaseService.addService(service);
    
    if (newService) {
      setServices(prev => [...prev, newService]);
      console.log('Service added successfully');
    }
  };

  // Update an existing service
  const updateService = async (id: string, serviceData: Partial<Service>) => {
    const success = await supabaseService.updateService(id, serviceData);
    
    if (success) {
      setServices(prev =>
        prev.map(service =>
          service.id === id ? { ...service, ...serviceData } : service
        )
      );
    }
  };

  // Delete a service
  const deleteService = async (id: string) => {
    const success = await supabaseService.deleteService(id);
    
    if (success) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  // Add a new order - now using database
  const addOrder = async (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">): Promise<string> => {
    let totalPointMoney = 0;
    order.products.forEach(product => {
      const productData = products.find(p => p.id === product.productId);
      if (productData) {
        const pointMoneyPerUnit = calculatePointsForProduct(productData.mrp, productData.price);
        totalPointMoney += pointMoneyPerUnit * product.quantity;
      }
    });
    
    const orderWithPoints = {
      ...order,
      points: totalPointMoney,
      mlmDistributionLog: [],
    };
    
    const newOrder = await supabaseService.addOrder(orderWithPoints);
    
    if (newOrder) {
      setOrders(prev => [...prev, newOrder]);
      return newOrder.id;
    }
    
    throw new Error('Failed to create order');
  };

  // Update an existing order - now using database
  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    const success = await supabaseService.updateOrder(id, orderData);
    
    if (success) {
      setOrders(prev =>
        prev.map(order => {
          if (order.id === id) {
            const updated = { ...order, ...orderData };
            
            // If order status is being changed to 'confirmed' and points haven't been awarded yet
            if (orderData.status === 'confirmed' && !order.isPointsAwarded && order.customerId) {
              console.log(`Order ${id} confirmed, awarding points to customer ${order.customerId}`);
              
              // Award points with order ID for tracking MLM distribution
              awardPoints(order.customerId, order.points, id);
              
              updated.isPointsAwarded = true;
              updated.deliveryApproved = false;
              
              // Update customer's total spent
              const currentMonth = new Date().toISOString().substring(0, 7);
              setCustomers(prevCustomers =>
                prevCustomers.map(customer => {
                  if (customer.id === order.customerId) {
                    const updatedCustomer = {
                      ...customer,
                      totalSpent: customer.totalSpent + order.amountPaid,
                      monthlySpent: {
                        ...customer.monthlySpent,
                        [currentMonth]: (customer.monthlySpent[currentMonth] || 0) + order.amountPaid
                      }
                    };
                    // Update in database
                    supabaseService.updateCustomer(customer.id, updatedCustomer);
                    return updatedCustomer;
                  }
                  return customer;
                })
              );

              // Update product stock quantities
              order.products.forEach(async (product) => {
                await updateProductStock(product.productId, product.quantity);
              });
            }
            
            if (orderData.status === 'delivered') {
              updated.deliveryApproved = true;
            }
            
            return updated;
          }
          return order;
        })
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        products,
        services,
        orders,
        offers,
        isLoading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addService,
        updateService,
        deleteService,
        addOrder,
        updateOrder,
        getNextAvailableCode,
        awardPoints,
        reserveCode,
        calculateTierBenefits,
        calculatePointsForProduct,
        moveCustomerInMLM,
        getMLMPath,
        refreshData,
        updateProductStock,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
