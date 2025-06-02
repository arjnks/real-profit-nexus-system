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
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, serviceData: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => string;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  getNextAvailableCode: () => string;
  awardPoints: (customerId: string, pointMoney: number) => void;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCustomers = localStorage.getItem("realprofit_customers");
    const storedProducts = localStorage.getItem("realprofit_products");
    const storedServices = localStorage.getItem("realprofit_services");
    const storedOrders = localStorage.getItem("realprofit_orders");
    const storedOffers = localStorage.getItem("realprofit_offers");

    if (storedCustomers) {
      const customers = JSON.parse(storedCustomers);
      const migratedCustomers = customers.map((customer: Customer) => ({
        ...customer,
        accumulatedPointMoney: customer.accumulatedPointMoney || 0
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
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedOffers) setOffers(JSON.parse(storedOffers));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("realprofit_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("realprofit_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("realprofit_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("realprofit_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("realprofit_offers", JSON.stringify(offers));
  }, [offers]);

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
      .filter(c => !c.isPending && c.code.startsWith('A'))
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

  // Award point money and distribute through MLM structure
  const awardPoints = (customerId: string, pointMoney: number) => {
    console.log(`Awarding ${pointMoney} point money to customer ${customerId}`);
    
    setCustomers(prev => {
      const newCustomers = prev.map(customer => ({ ...customer }));
      const customerIndex = newCustomers.findIndex(c => c.id === customerId);
      
      if (customerIndex === -1) {
        console.log(`Customer ${customerId} not found`);
        return prev;
      }
      
      const customer = newCustomers[customerIndex];
      
      // Add point money to accumulated amount
      const newAccumulated = customer.accumulatedPointMoney + pointMoney;
      
      // Calculate how many full points can be awarded (₹5 = 1 point)
      const newPoints = Math.floor(newAccumulated / 5);
      const remainingMoney = newAccumulated % 5;
      
      console.log(`Customer ${customerId}: ${newAccumulated} accumulated, awarding ${newPoints} points, ${remainingMoney} remaining`);
      
      // Update customer with new points and remaining accumulated money
      newCustomers[customerIndex] = {
        ...customer,
        points: customer.points + newPoints,
        accumulatedPointMoney: remainingMoney,
        tier: calculateTier(customer.points + newPoints)
      };
      
      // Distribute ₹1 to each of the 5 parent levels for each point earned
      if (newPoints > 0) {
        const mlmPath = getMLMPath(customer.code);
        
        mlmPath.forEach((parentCode, level) => {
          const parentIndex = newCustomers.findIndex(c => c.code === parentCode);
          if (parentIndex !== -1) {
            // Add ₹1 per point earned as mini coins
            const miniCoinsToAdd = newPoints; // ₹1 per point = 1 mini coin per point
            
            newCustomers[parentIndex] = {
              ...newCustomers[parentIndex],
              miniCoins: newCustomers[parentIndex].miniCoins + miniCoinsToAdd
            };
            
            // Convert mini coins to points (5 mini coins = 1 point)
            if (newCustomers[parentIndex].miniCoins >= 5) {
              const parentNewPoints = Math.floor(newCustomers[parentIndex].miniCoins / 5);
              newCustomers[parentIndex] = {
                ...newCustomers[parentIndex],
                points: newCustomers[parentIndex].points + parentNewPoints,
                miniCoins: newCustomers[parentIndex].miniCoins % 5,
                tier: calculateTier(newCustomers[parentIndex].points + parentNewPoints)
              };
              
              console.log(`Parent ${parentCode} at level ${level + 1} received ${miniCoinsToAdd} mini coins, converted ${parentNewPoints} points`);
            }
          }
        });
      }
      
      return newCustomers;
    });
  };

  // Add a new customer
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
    };
    
    setCustomers(prev => [...prev, newCustomer]);
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
    
    // Calculate total point money based on MRP vs selling price difference
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
            
            // Award points immediately when order is confirmed
            awardPoints(order.customerId, order.points);
            
            // Mark points as awarded
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
          
          // If order status is being changed to 'delivered'
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
        addCustomer,
        updateCustomer,
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
