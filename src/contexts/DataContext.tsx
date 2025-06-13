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
  // New MLM fields
  mlmLevel: number; // 1-6 levels
  directReferrals: string[]; // Array of customer codes directly referred
  totalDownlineCount: number; // Total count of downline members
  monthlyCommissions: Record<string, number>; // Monthly commission earnings
  totalCommissions: number; // Total lifetime commissions
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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
  categories: Category[];
  products: Product[];
  services: Service[];
  orders: Order[];
  offers: Offer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">) => Promise<Customer | null>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
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
  getMLMCommissionStructure: (level: number) => number;
  calculateMLMCommissions: (customerId: string, purchaseAmount: number, orderId?: string) => void;
  getDownlineStructure: (customerCode: string) => any;
  canAddReferral: (customerCode: string) => boolean;
  addReferral: (parentCode: string, childCode: string) => Promise<boolean>;
  getMLMStatistics: (customerCode: string) => {
    level: number;
    directReferrals: number;
    totalDownline: number;
    monthlyCommissions: number;
    totalCommissions: number;
  };
  isAdmin: (customerCode: string) => boolean;
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
  const [categories, setCategories] = useState<Category[]>([]);
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
      
      const [customersData, categoriesData, productsData, servicesData, ordersData] = await Promise.all([
        supabaseService.getCustomers(),
        supabaseService.getCategories(),
        supabaseService.getProducts(),
        supabaseService.getServices(),
        supabaseService.getOrders(),
      ]);

      console.log('Data loaded:', { 
        customers: customersData.length,
        categories: categoriesData.length, 
        products: productsData.length, 
        services: servicesData.length,
        orders: ordersData.length
      });

      setCustomers(customersData);
      setCategories(categoriesData);
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

  // Check if a customer code is admin (A100)
  const isAdmin = (customerCode: string): boolean => {
    return customerCode === 'A100';
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

  // Enhanced award points function with MLM distribution
  const awardPoints = async (customerId: string, pointMoney: number, orderId?: string) => {
    console.log(`Awarding ${pointMoney} point money to customer ${customerId} for order ${orderId}`);
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      console.log(`Customer ${customerId} not found`);
      return;
    }

    // Award points to the customer who made the purchase
    const newAccumulated = customer.accumulatedPointMoney + pointMoney;
    const newPoints = Math.floor(newAccumulated / 5);
    const remainingMoney = newAccumulated % 5;
    
    console.log(`Customer ${customer.code}: ${newAccumulated} accumulated, awarding ${newPoints} points, ${remainingMoney} remaining`);
    
    const updatedCustomer = {
      ...customer,
      points: customer.points + newPoints,
      accumulatedPointMoney: remainingMoney,
      tier: calculateTier(customer.points + newPoints),
      lastMLMDistribution: orderId ? new Date().toISOString() : customer.lastMLMDistribution
    };

    await updateCustomer(customerId, updatedCustomer);

    // MLM Distribution - traverse up 6 levels
    if (customer.parentCode) {
      let currentParentCode = customer.parentCode;
      let level = 1;

      while (currentParentCode && level <= 6) {
        const parentCustomer = customers.find(c => c.code === currentParentCode);
        if (!parentCustomer) break;

        // Each parent earns 1 point for every ₹5 spent by downline
        const mlmPointsEarned = Math.floor(pointMoney / 5);
        
        if (mlmPointsEarned > 0) {
          const updatedParent = {
            ...parentCustomer,
            points: parentCustomer.points + mlmPointsEarned,
            miniCoins: parentCustomer.miniCoins + mlmPointsEarned,
            lastMLMDistribution: new Date().toISOString()
          };

          // Update tier based on new points
          updatedParent.tier = calculateTier(updatedParent.points);

          await updateCustomer(parentCustomer.id, updatedParent);
          
          console.log(`MLM Level ${level}: ${parentCustomer.code} earned ${mlmPointsEarned} points from ₹${pointMoney} purchase`);
        }

        currentParentCode = parentCustomer.parentCode;
        level++;
      }
    }
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

  // Enhanced update customer function with proper MLM structure updates
  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    console.log('Updating customer:', id, customerData);
    
    const success = await supabaseService.updateCustomer(id, customerData);
    
    if (success) {
      setCustomers(prev =>
        prev.map(customer => {
          if (customer.id === id) {
            const updated = { ...customer, ...customerData };
            if (customerData.points !== undefined) {
              updated.tier = calculateTier(updated.points);
            }
            console.log('Customer updated in state:', updated);
            return updated;
          }
          return customer;
        })
      );
      
      // Refresh data to ensure consistency after MLM structure changes
      if (customerData.parentCode !== undefined) {
        console.log('MLM structure changed, refreshing data...');
        setTimeout(() => refreshData(), 500);
      }
    } else {
      console.error('Failed to update customer in database');
    }
  };

  // Delete a customer
  const deleteCustomer = async (id: string) => {
    console.log('Deleting customer:', id);
    const success = await supabaseService.deleteCustomer(id);
    
    if (success) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      console.log('Customer deleted successfully');
    } else {
      console.error('Failed to delete customer');
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
      mlmLevel: 1,
      directReferrals: [],
      totalDownlineCount: 0,
      monthlyCommissions: {},
      totalCommissions: 0,
    });
  };

  // Add a new category
  const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    console.log('Adding category:', category);
    const newCategory = await supabaseService.addCategory(category);
    
    if (newCategory) {
      setCategories(prev => [...prev, newCategory]);
      console.log('Category added successfully to state, total categories:', categories.length + 1);
    } else {
      console.error('Failed to add category to database');
      throw new Error('Failed to add category');
    }
  };

  // Update an existing category
  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    const success = await supabaseService.updateCategory(id, categoryData);
    
    if (success) {
      setCategories(prev =>
        prev.map(category =>
          category.id === id ? { ...category, ...categoryData } : category
        )
      );
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    const success = await supabaseService.deleteCategory(id);
    
    if (success) {
      setCategories(prev => prev.filter(category => category.id !== id));
    }
  };

  // FIXED: Enhanced add product function with immediate state update
  const addProduct = async (product: Omit<Product, "id">) => {
    console.log('Adding product to database:', product);
    
    try {
      const newProduct = await supabaseService.addProduct(product);
      
      if (newProduct) {
        // Immediately update local state
        setProducts(prev => {
          const updated = [...prev, newProduct];
          console.log('Product added to state successfully. New count:', updated.length);
          return updated;
        });
        
        console.log('Product added successfully to both database and state');
        return newProduct;
      } else {
        console.error('No product returned from supabaseService.addProduct');
        throw new Error('Failed to add product - no product returned from database');
      }
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error;
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

  // Enhanced add order function
  const addOrder = async (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">): Promise<string> => {
    let totalPointMoney = 0;
    
    // Calculate point money based on MRP vs selling price difference
    order.products.forEach(product => {
      const productData = products.find(p => p.id === product.productId);
      if (productData) {
        // Calculate point money: MRP - selling price (product.price in the order)
        const pointMoneyPerUnit = calculatePointsForProduct(productData.mrp, product.price);
        totalPointMoney += pointMoneyPerUnit * product.quantity;
        console.log(`Product ${productData.name}: MRP ₹${productData.mrp}, Selling ₹${product.price}, Point Money per unit: ₹${pointMoneyPerUnit}, Quantity: ${product.quantity}`);
      }
    });
    
    console.log(`Order total point money calculated: ₹${totalPointMoney}`);
    
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

  // Enhanced update order function
  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    console.log('Updating order:', id, orderData);
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

  // Enhanced moveCustomerInMLM function with better error handling and data refresh
  const moveCustomerInMLM = async (customerId: string, newParentCode: string | null) => {
    console.log('Moving customer in MLM:', customerId, 'to parent:', newParentCode);
    
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      console.error('Customer not found for MLM move:', customerId);
      return;
    }

    // Validate parent exists if not A100/null
    if (newParentCode && newParentCode !== 'A100') {
      const parentExists = customers.some(c => c.code === newParentCode);
      if (!parentExists) {
        console.error('Parent code does not exist:', newParentCode);
        throw new Error(`Parent code ${newParentCode} does not exist`);
      }
    }

    const finalParentCode = newParentCode === 'A100' ? null : newParentCode;
    
    try {
      const success = await supabaseService.updateCustomer(customerId, {
        parentCode: finalParentCode
      });

      if (success) {
        console.log('Customer MLM parent updated in database');
        
        // Update local state immediately
        setCustomers(prev =>
          prev.map(c =>
            c.id === customerId
              ? { ...c, parentCode: finalParentCode }
              : c
          )
        );
        
        // Force refresh after a short delay to ensure consistency
        setTimeout(async () => {
          console.log('Refreshing data after MLM structure change...');
          await refreshData();
        }, 1000);
        
        console.log('MLM structure updated successfully');
      } else {
        throw new Error('Failed to update customer in database');
      }
    } catch (error) {
      console.error('Error moving customer in MLM:', error);
      throw error;
    }
  };

  // MLM Commission Structure (hidden from customers)
  const getMLMCommissionStructure = (level: number): number => {
    const commissionRates = {
      1: 0.10, // 10% for direct referrals (Level 1)
      2: 0.05, // 5% for Level 2
      3: 0.03, // 3% for Level 3
      4: 0.02, // 2% for Level 4
      5: 0.01, // 1% for Level 5
      6: 0.005 // 0.5% for Level 6
    };
    return commissionRates[level as keyof typeof commissionRates] || 0;
  };

  // Check if customer can add more referrals (max 5 direct referrals)
  const canAddReferral = (customerCode: string): boolean => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return false;
    return customer.directReferrals.length < 5;
  };

  // Add a referral to the MLM structure
  const addReferral = async (parentCode: string, childCode: string): Promise<boolean> => {
    const parent = customers.find(c => c.code === parentCode);
    const child = customers.find(c => c.code === childCode);
    
    if (!parent || !child || !canAddReferral(parentCode) || child.parentCode) {
      return false;
    }

    // Update child's parent
    await updateCustomer(child.id, { 
      parentCode: parentCode,
      mlmLevel: Math.min(parent.mlmLevel + 1, 6)
    });

    // Update parent's direct referrals
    const updatedDirectReferrals = [...parent.directReferrals, childCode];
    await updateCustomer(parent.id, { 
      directReferrals: updatedDirectReferrals,
      totalDownlineCount: parent.totalDownlineCount + 1
    });

    // Update all upline members' downline counts
    let currentParentCode = parentCode;
    for (let i = 0; i < 6; i++) {
      const currentParent = customers.find(c => c.code === currentParentCode);
      if (!currentParent || !currentParent.parentCode) break;
      
      await updateCustomer(currentParent.id, {
        totalDownlineCount: currentParent.totalDownlineCount + 1
      });
      
      currentParentCode = currentParent.parentCode;
    }

    return true;
  };

  // Get downline structure for admin view
  const getDownlineStructure = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return null;

    const buildDownline = (code: string, level: number = 1): any => {
      if (level > 6) return null;
      
      const member = customers.find(c => c.code === code);
      if (!member) return null;

      const directReferrals = customers.filter(c => c.parentCode === code);
      
      return {
        ...member,
        level,
        children: directReferrals.map(ref => buildDownline(ref.code, level + 1)).filter(Boolean)
      };
    };

    return buildDownline(customerCode);
  };

  // Calculate MLM commissions (hidden backend logic)
  const calculateMLMCommissions = (customerId: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    console.log(`Calculating MLM commissions for ${customer.code} purchase of ₹${purchaseAmount}`);
    
    let currentCode = customer.parentCode;
    let level = 1;
    const distributionLog: string[] = [];

    // Traverse up to 6 levels
    while (currentCode && level <= 6) {
      const uplineMember = customers.find(c => c.code === currentCode);
      if (!uplineMember) break;

      const commissionRate = getMLMCommissionStructure(level);
      const commissionAmount = purchaseAmount * commissionRate;

      if (commissionAmount > 0) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        // Update upline member's commissions
        const updatedMonthlyCommissions = {
          ...uplineMember.monthlyCommissions,
          [currentMonth]: (uplineMember.monthlyCommissions[currentMonth] || 0) + commissionAmount
        };

        const updatedMember = {
          ...uplineMember,
          monthlyCommissions: updatedMonthlyCommissions,
          totalCommissions: uplineMember.totalCommissions + commissionAmount,
          // Convert commission to mini coins (1 rupee = 1 mini coin)
          miniCoins: uplineMember.miniCoins + Math.floor(commissionAmount),
          lastMLMDistribution: new Date().toISOString()
        };

        // Convert mini coins to points if >= 5
        if (updatedMember.miniCoins >= 5) {
          const newPoints = Math.floor(updatedMember.miniCoins / 5);
          updatedMember.points += newPoints;
          updatedMember.miniCoins = updatedMember.miniCoins % 5;
          updatedMember.tier = calculateTier(updatedMember.points);
        }

        // Update in state and database
        setCustomers(prev => prev.map(c => c.id === uplineMember.id ? updatedMember : c));
        supabaseService.updateCustomer(uplineMember.id, updatedMember);

        distributionLog.push(`Level ${level}: ${uplineMember.code} received ₹${commissionAmount.toFixed(2)} commission (${(commissionRate * 100).toFixed(1)}%)`);
        
        console.log(`Level ${level}: ${uplineMember.code} received ₹${commissionAmount.toFixed(2)} commission`);
      }

      currentCode = uplineMember.parentCode;
      level++;
    }

    // Update order with MLM distribution log
    if (orderId && distributionLog.length > 0) {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, mlmDistributionLog: [...(order.mlmDistributionLog || []), ...distributionLog] }
          : order
      ));
    }
  };

  // Get MLM statistics for a customer
  const getMLMStatistics = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) {
      return {
        level: 1,
        directReferrals: 0,
        totalDownline: 0,
        monthlyCommissions: 0,
        totalCommissions: 0
      };
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    
    return {
      level: customer.mlmLevel,
      directReferrals: customer.directReferrals.length,
      totalDownline: customer.totalDownlineCount,
      monthlyCommissions: customer.monthlyCommissions[currentMonth] || 0,
      totalCommissions: customer.totalCommissions
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
        getNextAvailableCode,
        awardPoints,
        reserveCode,
        calculateTierBenefits,
        calculatePointsForProduct,
        moveCustomerInMLM,
        getMLMPath,
        refreshData,
        updateProductStock,
        getMLMCommissionStructure,
        calculateMLMCommissions,
        getDownlineStructure,
        canAddReferral,
        addReferral,
        getMLMStatistics,
        isAdmin,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
