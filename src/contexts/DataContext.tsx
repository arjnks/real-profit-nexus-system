
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
  addOrder: (order: Omit<Order, "id" | "orderDate">) => string;
  updateOrder: (id: string, orderData: Partial<Order>) => void;
}

// Mock data
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
    points: 120,
    tier: "Bronze",
    parentCode: "A100",
    joinedDate: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Jane Smith",
    phone: "9876543211",
    code: "A102",
    points: 550,
    tier: "Silver",
    parentCode: "A100",
    joinedDate: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Pending User",
    phone: "9876543212",
    code: "A103",
    points: 0,
    tier: "Bronze",
    parentCode: "A101",
    joinedDate: new Date().toISOString(),
    isPending: true,
  },
];

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Organic Bananas",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=200",
    description: "Organic bananas sourced from local farms",
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
    points: 37,
    status: "delivered",
    paymentMethod: "cod",
    address: "123 Main St, City",
    pincode: "680305",
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    isPendingApproval: false,
    isPointsAwarded: true
  },
  {
    id: "ORD10002",
    customerId: "3",
    customerName: "Jane Smith",
    customerPhone: "9876543211",
    customerCode: "A102",
    products: [
      { productId: "3", name: "Whole Wheat Bread", price: 45.00, quantity: 2 }
    ],
    totalAmount: 90.00,
    points: 18,
    status: "pending",
    paymentMethod: "upi",
    address: "456 Oak St, Town",
    pincode: "680305",
    orderDate: new Date().toISOString(),
    isPendingApproval: true,
    isPointsAwarded: false
  }
];

const initialOffers: Offer[] = [
  {
    id: "1",
    title: "Diamond Member Special",
    description: "Get 70% off using your points balance",
    minTier: "Diamond",
    discountPercentage: 70,
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=200"
  },
  {
    id: "2",
    title: "Gold Member Offer",
    description: "Get 30% off using your points balance",
    minTier: "Gold",
    discountPercentage: 30,
    validUntil: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
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

  // Add a new customer
  const addCustomer = (customer: Omit<Customer, "id" | "joinedDate">) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      joinedDate: new Date().toISOString(),
    };
    
    setCustomers((prev) => [...prev, newCustomer]);
  };

  // Update an existing customer
  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, ...customerData } : customer
      )
    );
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
        addOrder,
        updateOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
