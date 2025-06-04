import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export type Customer = {
  id: string;
  name: string;
  phone: string;
  code: string;
  points: number;
  miniCoins: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  parentCode: string | null;
  joinedDate: string;
  isReserved?: boolean;
  isPending?: boolean;
  totalSpent: number;
  monthlySpent: { [month: string]: number };
  accumulatedPointMoney: number;
  lastMLMDistribution?: string; // Track last MLM distribution
};

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
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
  mlmDistributionLog?: string[]; // Track MLM distribution for this order
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
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, serviceData: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => string;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  getNextAvailableCode: () => string;
  awardPoints: (customerId: string, pointMoney: number, orderId?: string) => void;
  reserveCode: (code: string, name: string, phone: string) => void;
  calculateTierBenefits: (tier: string) => number;
  calculatePointsForProduct: (mrp: number, sellingPrice: number) => number;
  moveCustomerInMLM: (customerId: string, newParentCode: string | null) => void;
  getMLMPath: (customerCode: string) => string[];
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

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedCustomers = localStorage.getItem("realprofit_customers");
        const storedProducts = localStorage.getItem("realprofit_products");
        const storedServices = localStorage.getItem("realprofit_services");
        const storedOrders = localStorage.getItem("realprofit_orders");
        const storedOffers = localStorage.getItem("realprofit_offers");

        if (storedCustomers) {
          const customers = JSON.parse(storedCustomers);
          console.log('Loading customers from localStorage:', customers.length);
          const migratedCustomers = customers.map((customer: Customer) => ({
            ...customer,
            accumulatedPointMoney: customer.accumulatedPointMoney || 0,
            lastMLMDistribution: customer.lastMLMDistribution || null,
            isPending: false // Ensure all existing customers are active
          }));
          setCustomers(migratedCustomers);
        }
        
        if (storedProducts) {
          const products = JSON.parse(storedProducts);
          const migratedProducts = products.map((product: Product) => ({
            ...product,
            tierDiscounts: product.tierDiscounts || {
              Bronze: 2,
              Silver: 3,
              Gold: 4,
              Diamond: 5
            }
          }));
          setProducts(migratedProducts);
        }
        if (storedServices) setServices(JSON.parse(storedServices));
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const migratedOrders = orders.map((order: Order) => ({
            ...order,
            mlmDistributionLog: order.mlmDistributionLog || []
          }));
          setOrders(migratedOrders);
        }
        if (storedOffers) setOffers(JSON.parse(storedOffers));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes - with immediate effect
  useEffect(() => {
    if (!isLoading) {
      console.log('Saving customers to localStorage:', customers.length);
      localStorage.setItem("realprofit_customers", JSON.stringify(customers));
    }
  }, [customers, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("realprofit_products", JSON.stringify(products));
    }
  }, [products, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("realprofit_services", JSON.stringify(services));
    }
  }, [services, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("realprofit_orders", JSON.stringify(orders));
    }
  }, [orders, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("realprofit_offers", JSON.stringify(offers));
    }
  }, [offers, isLoading]);

  // Calculate point money based on MRP vs Selling Price difference
  const calculatePointsForProduct = (mrp: number, sellingPrice: number): number => {
    const difference = mrp - sellingPrice;
    return Math.max(0, Math.floor(difference));
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
  const moveCustomerInMLM = (customerId: string, newParentCode: string | null) => {
    setCustomers(prev => {
      const newCustomers = prev.map(customer => ({ ...customer }));
      const customerIndex = newCustomers.findIndex(c => c.id === customerId);
      
      if (customerIndex === -1) return prev;
      
      // Validate new parent exists (except for A100 or null)
      if (newParentCode && newParentCode !== 'A100') {
        const parentExists = newCustomers.some(c => c.code === newParentCode);
        if (!parentExists) {
          console.error(`Parent code ${newParentCode} doesn't exist`);
          return prev;
        }
      }
      
      newCustomers[customerIndex] = {
        ...newCustomers[customerIndex],
        parentCode: newParentCode === 'A100' ? null : newParentCode
      };
      
      return newCustomers;
    });
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
    if (points >= 20) return 'Bronze';
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
      newCustomers[customerIndex] = {
        ...customer,
        points: customer.points + newPoints,
        accumulatedPointMoney: remainingMoney,
        tier: calculateTier(customer.points + newPoints),
        lastMLMDistribution: orderId ? new Date().toISOString() : customer.lastMLMDistribution
      };
      
      // Track MLM distribution log for the order
      const mlmDistributionLog: string[] = [];
      
      // Distribute ₹1 to each of the 5 parent levels for each point earned
      if (newPoints > 0) {
        const mlmPath = getMLMPath(customer.code);
        
        mlmDistributionLog.push(`Customer ${customer.code} earned ${newPoints} points from ₹${pointMoney} point money`);
        
        mlmPath.forEach((parentCode, level) => {
          const parentIndex = newCustomers.findIndex(c => c.code === parentCode);
          if (parentIndex !== -1) {
            const miniCoinsToAdd = newPoints;
            
            newCustomers[parentIndex] = {
              ...newCustomers[parentIndex],
              miniCoins: newCustomers[parentIndex].miniCoins + miniCoinsToAdd,
              lastMLMDistribution: new Date().toISOString()
            };
            
            mlmDistributionLog.push(`Level ${level + 1}: ${parentCode} received ${miniCoinsToAdd} mini coins`);
            
            // Convert mini coins to points (5 mini coins = 1 point)
            if (newCustomers[parentIndex].miniCoins >= 5) {
              const parentNewPoints = Math.floor(newCustomers[parentIndex].miniCoins / 5);
              newCustomers[parentIndex] = {
                ...newCustomers[parentIndex],
                points: newCustomers[parentIndex].points + parentNewPoints,
                miniCoins: newCustomers[parentIndex].miniCoins % 5,
                tier: calculateTier(newCustomers[parentIndex].points + parentNewPoints)
              };
              
              mlmDistributionLog.push(`Level ${level + 1}: ${parentCode} converted ${parentNewPoints} points from mini coins`);
              console.log(`Parent ${parentCode} at level ${level + 1} received ${miniCoinsToAdd} mini coins, converted ${parentNewPoints} points`);
            }
          }
        });
      }
      
      // Update the order with MLM distribution log
      if (orderId) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, mlmDistributionLog }
              : order
          )
        );
      }
      
      return newCustomers;
    });
  };

  // Add a new customer (now immediately active)
  const addCustomer = (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      joinedDate: new Date().toISOString(),
      points: 0,
      miniCoins: 0,
      tier: 'Bronze',
      totalSpent: 0,
      monthlySpent: {},
      accumulatedPointMoney: 0,
      isPending: false, // Immediately active
    };
    
    console.log('Adding customer to state:', newCustomer);
    setCustomers(prev => {
      const newCustomers = [...prev, newCustomer];
      console.log('New customers array length:', newCustomers.length);
      return newCustomers;
    });
  };

  // Update an existing customer
  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
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
  };

  // Delete a customer
  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // Reserve a code
  const reserveCode = (code: string, name: string, phone: string) => {
    const newCustomer: Customer = {
      id: `reserved_${Date.now()}`,
      name,
      phone,
      code,
      points: 0,
      miniCoins: 0,
      tier: 'Bronze',
      parentCode: null,
      joinedDate: new Date().toISOString(),
      isReserved: true,
      isPending: false,
      totalSpent: 0,
      monthlySpent: {},
      accumulatedPointMoney: 0,
    };
    
    setCustomers(prev => [...prev, newCustomer]);
  };

  // Add a new product
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      tierDiscounts: product.tierDiscounts || {
        Bronze: 2,
        Silver: 3,
        Gold: 4,
        Diamond: 5
      }
    };
    
    setProducts(prev => [...prev, newProduct]);
  };

  // Update an existing product
  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Add a new service
  const addService = (service: Omit<Service, "id">) => {
    const newService: Service = {
      ...service,
      id: `service_${Date.now()}`,
    };
    
    setServices(prev => [...prev, newService]);
  };

  // Update an existing service
  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, ...serviceData } : service
      )
    );
  };

  // Delete a service
  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  // Add a new order
  const addOrder = (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => {
    const orderId = `ORD${Math.floor(10000 + Math.random() * 90000)}`;
    
    let totalPointMoney = 0;
    order.products.forEach(product => {
      const productData = products.find(p => p.id === product.productId);
      if (productData) {
        const pointMoneyPerUnit = calculatePointsForProduct(productData.mrp, productData.price);
        totalPointMoney += pointMoneyPerUnit * product.quantity;
      }
    });
    
    const newOrder: Order = {
      ...order,
      id: orderId,
      orderDate: new Date().toISOString(),
      points: totalPointMoney,
      isPendingApproval: true,
      isPointsAwarded: false,
      deliveryApproved: false,
      pointsApproved: false,
      mlmDistributionLog: [],
    };
    
    setOrders(prev => [...prev, newOrder]);
    return orderId;
  };

  // Update an existing order
  const updateOrder = (id: string, orderData: Partial<Order>) => {
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
                  return {
                    ...customer,
                    totalSpent: customer.totalSpent + order.amountPaid,
                    monthlySpent: {
                      ...customer.monthlySpent,
                      [currentMonth]: (customer.monthlySpent[currentMonth] || 0) + order.amountPaid
                    }
                  };
                }
                return customer;
              })
            );
          }
          
          if (orderData.status === 'delivered') {
            updated.deliveryApproved = true;
          }
          
          return updated;
        }
        return order;
      })
    );
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
