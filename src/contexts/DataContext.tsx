
import React, { createContext, useContext, useState } from "react";

// Types
export type Customer = {
  id: string;
  name: string;
  phone: string;
  code: string;
  points: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  parentCode: string | null;
  joinedDate: string;
  isReserved?: boolean;
  isPending?: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCode: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  points: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled" | "refunded";
  paymentMethod: "cod" | "upi";
  address: string;
  pincode: string;
  orderDate: string;
  isPendingApproval: boolean;
  isPointsAwarded: boolean;
  usedPointsDiscount?: boolean;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  minTier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  discountPercentage: number;
  validUntil: string;
  image: string;
};

interface DataContextType {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  offers: Offer[];
  addCustomer: (customer: Omit<Customer, "id" | "joinedDate">) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "orderDate">) => string;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
  getNextAvailableCode: () => string;
}

// Mock data with updated tier thresholds and point calculations
const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Admin",
    phone: "0000000000",
    code: "A100",
    points: 1000,
    tier: "Diamond",
    parentCode: null,
    joinedDate: new Date().toISOString(),
  },
  {
    id: "2",
    name: "John Doe",
    phone: "9876543210",
    code: "A101",
    points: 45, // Bronze tier (20+ points)
    tier: "Bronze",
    parentCode: "A100",
    joinedDate: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Jane Smith",
    phone: "9876543211",
    code: "A102",
    points: 85, // Gold tier (80+ points)
    tier: "Gold",
    parentCode: "A100",
    joinedDate: new Date().toISOString(),
  },
];

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Organic Bananas",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=200",
    description: "Fresh organic bananas sourced from local farms",
    category: "Fruits",
  },
  {
    id: "2",
    name: "Fresh Milk",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=200",
    description: "Fresh cow milk, 1 liter pack",
    category: "Dairy",
  },
  {
    id: "3",
    name: "Whole Wheat Bread",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=200",
    description: "Freshly baked whole wheat bread",
    category: "Bakery",
  },
  {
    id: "4",
    name: "Basmati Rice",
    price: 125.00,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200",
    description: "Premium basmati rice, 1kg pack",
    category: "Grains",
  },
  {
    id: "5",
    name: "Fresh Tomatoes",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1546470427-7e5c2f2b6aff?q=80&w=200",
    description: "Fresh red tomatoes, 500g",
    category: "Vegetables",
  },
];

const initialOrders: Order[] = [
  {
    id: "ORD10001",
    customerId: "2",
    customerName: "John Doe",
    customerPhone: "9876543210",
    customerCode: "A101",
    products: [
      { productId: "1", name: "Organic Bananas", price: 49.99, quantity: 2 },
      { productId: "2", name: "Fresh Milk", price: 89.99, quantity: 1 }
    ],
    totalAmount: 189.97,
    points: 37, // amount/5 = 189.97/5 = 37.99, rounded down
    status: "delivered",
    paymentMethod: "cod",
    address: "123 Main St, City",
    pincode: "680305",
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    isPendingApproval: false,
    isPointsAwarded: true
  },
];

const initialOffers: Offer[] = [
  {
    id: "1",
    title: "Diamond Member Special",
    description: "Use up to 70% of product value with your points",
    minTier: "Diamond",
    discountPercentage: 70,
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=200"
  },
  {
    id: "2",
    title: "Gold Member Offer",
    description: "Use up to 30% of product value with your points",
    minTier: "Gold",
    discountPercentage: 30,
    validUntil: new Date(Date.now() + 86400000 * 15).toISOString(),
    image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?q=80&w=200"
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);

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

  // Add a new customer
  const addCustomer = (customer: Omit<Customer, "id" | "joinedDate">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      joinedDate: new Date().toISOString(),
      tier: calculateTier(customer.points),
    };
    
    setCustomers((prev) => [...prev, newCustomer]);
  };

  // Update an existing customer
  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) => {
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

  // Add a new product
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
    };
    
    setProducts((prev) => [...prev, newProduct]);
  };

  // Update an existing product
  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // Add a new order
  const addOrder = (order: Omit<Order, "id" | "orderDate">) => {
    const orderId = `ORD${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...order,
      id: orderId,
      orderDate: new Date().toISOString(),
    };
    
    setOrders((prev) => [...prev, newOrder]);
    return orderId;
  };

  // Update an existing order
  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, ...orderData } : order
      )
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
