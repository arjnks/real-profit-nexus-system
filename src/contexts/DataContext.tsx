
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
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
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
  address: string;
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
  orders: Order[];
  offers: Offer[];
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => string;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  getNextAvailableCode: () => string;
  awardPoints: (customerId: string, points: number) => void;
  reserveCode: (code: string, name: string, phone: string) => void;
  calculateTierBenefits: (tier: string) => number;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCustomers = localStorage.getItem("realprofit_customers");
    const storedProducts = localStorage.getItem("realprofit_products");
    const storedOrders = localStorage.getItem("realprofit_orders");
    const storedOffers = localStorage.getItem("realprofit_offers");

    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    if (storedProducts) setProducts(JSON.parse(storedProducts));
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
    localStorage.setItem("realprofit_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("realprofit_offers", JSON.stringify(offers));
  }, [offers]);

  // Get next available sequential code
  const getNextAvailableCode = (): string => {
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
  const addCustomer = (customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      joinedDate: new Date().toISOString(),
      points: 0,
      miniCoins: 0,
      tier: 'Bronze',
      totalSpent: 0,
      monthlySpent: {},
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

  // Award points and distribute mini coins through MLM tree
  const awardPoints = (customerId: string, points: number) => {
    setCustomers(prev => {
      const updated = [...prev];
      const customerIndex = updated.findIndex(c => c.id === customerId);
      
      if (customerIndex === -1) return prev;
      
      // Award points to customer
      updated[customerIndex] = {
        ...updated[customerIndex],
        points: updated[customerIndex].points + points,
        tier: calculateTier(updated[customerIndex].points + points)
      };
      
      // Distribute mini coins to all parents in MLM tree
      let currentCode = updated[customerIndex].parentCode;
      while (currentCode) {
        const parentIndex = updated.findIndex(c => c.code === currentCode);
        if (parentIndex === -1) break;
        
        updated[parentIndex] = {
          ...updated[parentIndex],
          miniCoins: updated[parentIndex].miniCoins + points
        };
        
        // Convert mini coins to points (5 mini coins = 1 point)
        if (updated[parentIndex].miniCoins >= 5) {
          const newPoints = Math.floor(updated[parentIndex].miniCoins / 5);
          updated[parentIndex] = {
            ...updated[parentIndex],
            points: updated[parentIndex].points + newPoints,
            miniCoins: updated[parentIndex].miniCoins % 5,
            tier: calculateTier(updated[parentIndex].points + newPoints)
          };
        }
        
        currentCode = updated[parentIndex].parentCode;
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

  // Add a new order
  const addOrder = (order: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">) => {
    const orderId = `ORD${Math.floor(10000 + Math.random() * 90000)}`;
    const points = Math.floor(order.amountPaid / 5); // Points based on amount paid (not total amount if points were used)
    
    const newOrder: Order = {
      ...order,
      id: orderId,
      orderDate: new Date().toISOString(),
      points,
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
        orders,
        offers,
        addCustomer,
        updateCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrder,
        getNextAvailableCode,
        awardPoints,
        reserveCode,
        calculateTierBenefits,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
