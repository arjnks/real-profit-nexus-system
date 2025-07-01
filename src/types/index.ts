
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  code: string;
  parent_code: string | null;
  points: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  joined_date: string;
  is_reserved: boolean;
  is_pending: boolean;
  total_spent: number;
  monthly_spent: Record<string, number>;
  accumulated_point_money: number;
  password_hash?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  dummy_price?: number;
  image: string;
  description: string;
  category: string;
  in_stock: boolean;
  stock_quantity: number;
  tier_discounts: {
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
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_code: string;
  products: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  points_used: number;
  amount_paid: number;
  points: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
  payment_method: "cod" | "upi";
  pincode: string;
  delivery_address?: string;
  order_date: string;
  is_pending_approval: boolean;
  is_points_awarded: boolean;
  delivery_approved: boolean;
  points_approved: boolean;
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
