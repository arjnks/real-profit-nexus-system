
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  code: string;
  parentCode: string | null;
  points: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  joinedDate: string;
  isReserved: boolean;
  isPending: boolean;
  totalSpent: number;
  monthlySpent: Record<string, number>;
  accumulatedPointMoney: number;
  passwordHash?: string;
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
  deliveryAddress?: string;
  orderDate: string;
  isPendingApproval: boolean;
  isPointsAwarded: boolean;
  deliveryApproved: boolean;
  pointsApproved: boolean;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  username?: string;
  role: 'customer' | 'admin';
}

export interface DailySales {
  id: string;
  sale_date: string;
  total_sales: number;
  total_points: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardConfig {
  id: string;
  top_count: number;
  offer_title: string;
  offer_description: string;
  offer_discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  code: string;
  points: number;
  total_spent: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  rank: number;
}
