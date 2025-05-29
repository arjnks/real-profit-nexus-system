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
  accumulatedPointMoney: number; // New field to track accumulated money that hasn't been converted to points yet
};

export type Product = {
  id: string;
  name: string;
  price: number; // This is now the selling price (Company Profit Price)
  mrp: number; // Maximum Retail Price
  image: string;
  description: string;
  category: string;
  inStock: boolean;
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
      // Migrate existing customers to add accumulatedPointMoney field
      const migratedCustomers = customers.map((customer: Customer) => ({
        ...customer,
        accumulatedPointMoney: customer.accumulatedPointMoney || 0
      }));
      setCustomers(migratedCustomers);
    }
    if (storedProducts) setProducts(JSON.parse(storedProducts));
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

  // Calculate point money based on MRP vs Selling Price difference (not actual points)
  const calculatePointsForProduct = (mrp: number, sellingPrice: number): number => {
    const difference = mrp - sellingPrice;
    return Math.max(0, Math.floor(difference)); // Return the money amount, not points
  };

  // Get next available sequential code
  const getNextAvailableCode = (): string => {
    // ... keep existing code (getNextAvailableCode implementation)
    const activeCodes = customers
      .filter(c => !c.isPending && c.code.startsWith('A'))
      .map(c => parseInt(c.code.substring(1)))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    let nextNumber = 101; // Start from A101 (A100 is admin)
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

  // Calculate tier benefits (percentage of product value that can be paid with points)
  const calculateTierBenefits = (tier: string): number => {
    switch (tier) {
      case 'Diamond': return 70;
      case 'Gold': return 30;
      case 'Silver': return 20;
      case 'Bronze': return 10;
      default: return 10;
    }
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
          // Recalculate tier if points changed
          if (customerData.points !== undefined) {
            updated.tier = calculateTier(updated.points);
          }
          return updated;
        }
        return customer;
      })
    );
  };

  // Award point money and convert to actual points when accumulated amount reaches ₹5 or multiples
  const awardPoints = (customerId: string, pointMoney: number) => {
    setCustomers(prev => {
      const updated = [...prev];
      const customerIndex = updated.findIndex(c => c.id === customerId);
      
      if (customerIndex === -1) return prev;
      
      // Add point money to accumulated amount
      const newAccumulated = updated[customerIndex].accumulatedPointMoney + pointMoney;
      
      // Calculate how many full points can be awarded (₹5 = 1 point)
      const newPoints = Math.floor(newAccumulated / 5);
      const remainingMoney = newAccumulated % 5;
      
      // Update customer with new points and remaining accumulated money
      updated[customerIndex] = {
        ...updated[customerIndex],
        points: updated[customerIndex].points + newPoints,
        accumulatedPointMoney: remainingMoney,
        tier: calculateTier(updated[customerIndex].points + newPoints)
      };
      
      // Distribute mini coins to all parents in MLM tree (based on actual points awarded)
      if (newPoints > 0) {
        let currentCode = updated[customerIndex].parentCode;
        while (currentCode) {
          const parentIndex = updated.findIndex(c => c.code === currentCode);
          if (parentIndex === -1) break;
          
          updated[parentIndex] = {
            ...updated[parentIndex],
            miniCoins: updated[parentIndex].miniCoins + newPoints
          };
          
          // Convert mini coins to points (5 mini coins = 1 point)
          if (updated[parentIndex].miniCoins >= 5) {
            const parentNewPoints = Math.floor(updated[parentIndex].miniCoins / 5);
            updated[parentIndex] = {
              ...updated[parentIndex],
              points: updated[parentIndex].points + parentNewPoints,
              miniCoins: updated[parentIndex].miniCoins % 5,
              tier: calculateTier(updated[parentIndex].points + parentNewPoints)
            };
          }
          
          currentCode = updated[parentIndex].parentCode;
        }
      }
      
      return updated;
    });
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
    
    // Calculate total point money based on MRP vs selling price difference for each product
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
      points: totalPointMoney, // Store the total point money value
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
          
          // If order is approved and delivered, update customer's total spent
          if (orderData.status === 'delivered' && order.customerId) {
            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
