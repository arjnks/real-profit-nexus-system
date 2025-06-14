export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string; // Optional address field
  code: string;
  parentCode: string | null;
  points: number;
  miniCoins: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  joinedDate: string;
  isReserved: boolean;
  isPending: boolean;
  totalSpent: number;
  monthlySpent: Record<string, number>;
  accumulatedPointMoney: number;
  mlmLevel: number;
  directReferrals: string[];
  totalDownlineCount: number;
  monthlyCommissions: Record<string, number>;
  totalCommissions: number;
  lastMLMDistribution?: string;
  passwordHash?: string; // Optional password hash
  // Matrix MLM properties
  matrixEarnings?: number;
  totalCoins?: number;
  currentLevel?: number;
}

export interface Product {
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
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCode: string;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  pointsUsed: number;
  amountPaid: number;
  points: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentMethod: "cod" | "upi";
  pincode: string;
  deliveryAddress?: string; // Optional delivery address field
  orderDate: string;
  isPendingApproval: boolean;
  isPointsAwarded: boolean;
  deliveryApproved: boolean;
  pointsApproved: boolean;
  usedPointsDiscount: boolean;
  mlmDistributionLog: string[];
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  username?: string;
  role: 'customer' | 'admin';
}
