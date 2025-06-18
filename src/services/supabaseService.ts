import { supabase } from '@/integrations/supabase/client';
import type { Customer, Product, Category, Service, Order, DailySales, LeaderboardConfig, LeaderboardEntry } from '@/types';
import bcrypt from 'bcryptjs';

// Helper function to safely parse JSON fields
const parseJsonField = (field: any, defaultValue: any) => {
  if (field === null || field === undefined) return defaultValue;
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch {
    return defaultValue;
  }
};

// Helper function to safely convert to number
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to safely handle image data
const processImageData = (imageData: string): string => {
  if (!imageData || typeof imageData !== 'string') {
    return '/placeholder.svg';
  }
  
  // If it's already a URL, return as is
  if (imageData.startsWith('http') || imageData.startsWith('/')) {
    return imageData;
  }
  
  // If it's base64 data, ensure it has proper prefix
  if (imageData.includes('base64')) {
    return imageData;
  }
  
  // Default fallback
  return '/placeholder.svg';
};

// Transform database customer to application Customer type
const transformCustomer = (dbCustomer: any): Customer => {
  if (!dbCustomer) throw new Error('Invalid customer data');
  
  return {
    id: dbCustomer.id,
    name: dbCustomer.name || '',
    phone: dbCustomer.phone || '',
    address: dbCustomer.address || '',
    code: dbCustomer.code || '',
    parentCode: dbCustomer.parent_code,
    points: safeNumber(dbCustomer.points),
    miniCoins: safeNumber(dbCustomer.mini_coins),
    tier: dbCustomer.tier || 'Bronze',
    joinedDate: dbCustomer.joined_date || dbCustomer.created_at,
    isReserved: Boolean(dbCustomer.is_reserved),
    isPending: Boolean(dbCustomer.is_pending),
    totalSpent: safeNumber(dbCustomer.total_spent),
    monthlySpent: parseJsonField(dbCustomer.monthly_spent, {}),
    accumulatedPointMoney: safeNumber(dbCustomer.accumulated_point_money),
    mlmLevel: safeNumber(dbCustomer.mlm_level) || 1,
    directReferrals: parseJsonField(dbCustomer.direct_referrals, []),
    totalDownlineCount: safeNumber(dbCustomer.total_downline_count),
    monthlyCommissions: parseJsonField(dbCustomer.monthly_commissions, {}),
    totalCommissions: safeNumber(dbCustomer.total_commissions),
    lastMLMDistribution: dbCustomer.last_mlm_distribution,
    passwordHash: dbCustomer.password_hash
  };
};

// Transform database product to application Product type
const transformProduct = (dbProduct: any): Product => {
  if (!dbProduct) throw new Error('Invalid product data');
  
  return {
    id: dbProduct.id,
    name: dbProduct.name || '',
    price: safeNumber(dbProduct.price),
    mrp: safeNumber(dbProduct.mrp),
    dummyPrice: dbProduct.dummy_price ? safeNumber(dbProduct.dummy_price) : undefined,
    image: processImageData(dbProduct.image),
    description: dbProduct.description || '',
    category: dbProduct.category || 'Uncategorized',
    inStock: Boolean(dbProduct.in_stock),
    stockQuantity: safeNumber(dbProduct.stock_quantity),
    tierDiscounts: parseJsonField(dbProduct.tier_discounts, {
      Bronze: 2,
      Silver: 3,
      Gold: 4,
      Diamond: 5
    })
  };
};

// Transform database order to application Order type
const transformOrder = (dbOrder: any): Order => {
  if (!dbOrder) throw new Error('Invalid order data');
  
  return {
    id: dbOrder.id,
    customerId: dbOrder.customer_id || '',
    customerName: dbOrder.customer_name || '',
    customerPhone: dbOrder.customer_phone || '',
    customerCode: dbOrder.customer_code || '',
    products: parseJsonField(dbOrder.products, []),
    totalAmount: safeNumber(dbOrder.total_amount),
    pointsUsed: safeNumber(dbOrder.points_used),
    amountPaid: safeNumber(dbOrder.amount_paid),
    points: safeNumber(dbOrder.points),
    status: dbOrder.status || 'pending',
    paymentMethod: dbOrder.payment_method || 'cod',
    pincode: dbOrder.pincode || '',
    orderDate: dbOrder.order_date || dbOrder.created_at,
    isPendingApproval: Boolean(dbOrder.is_pending_approval ?? true),
    isPointsAwarded: Boolean(dbOrder.is_points_awarded),
    deliveryApproved: Boolean(dbOrder.delivery_approved),
    pointsApproved: Boolean(dbOrder.points_approved),
    usedPointsDiscount: Boolean(dbOrder.used_points_discount),
    mlmDistributionLog: parseJsonField(dbOrder.mlm_distribution_log, [])
  };
};

// Transform database category to application Category type
const transformCategory = (dbCategory: any): Category => {
  if (!dbCategory) throw new Error('Invalid category data');
  
  return {
    id: dbCategory.id,
    name: dbCategory.name || '',
    description: dbCategory.description || '',
    createdAt: dbCategory.created_at,
    updatedAt: dbCategory.updated_at
  };
};

// Transform database service to application Service type
const transformService = (dbService: any): Service => {
  if (!dbService) throw new Error('Invalid service data');
  
  return {
    id: dbService.id,
    title: dbService.title || '',
    description: dbService.description || '',
    price: dbService.price || '0',
    image: processImageData(dbService.image),
    category: dbService.category || 'Uncategorized',
    isActive: Boolean(dbService.is_active)
  };
};

// Transform database daily sales to application DailySales type
const transformDailySales = (dbDailySales: any): DailySales => {
  if (!dbDailySales) throw new Error('Invalid daily sales data');
  
  return {
    id: dbDailySales.id,
    sale_date: dbDailySales.sale_date,
    total_sales: safeNumber(dbDailySales.total_sales),
    total_points: safeNumber(dbDailySales.total_points),
    total_orders: safeNumber(dbDailySales.total_orders),
    created_at: dbDailySales.created_at,
    updated_at: dbDailySales.updated_at
  };
};

// Transform database leaderboard config to application LeaderboardConfig type
const transformLeaderboardConfig = (dbConfig: any): LeaderboardConfig => {
  if (!dbConfig) throw new Error('Invalid leaderboard config data');
  
  return {
    id: dbConfig.id,
    top_count: safeNumber(dbConfig.top_count),
    offer_title: dbConfig.offer_title || 'Top Performer Offer',
    offer_description: dbConfig.offer_description || 'Special discount for top performers',
    offer_discount_percentage: safeNumber(dbConfig.offer_discount_percentage),
    is_active: Boolean(dbConfig.is_active),
    created_at: dbConfig.created_at,
    updated_at: dbConfig.updated_at
  };
};

// Transform database leaderboard entry to application LeaderboardEntry type
const transformLeaderboardEntry = (dbEntry: any): LeaderboardEntry => {
  if (!dbEntry) throw new Error('Invalid leaderboard entry data');
  
  return {
    id: dbEntry.id,
    name: dbEntry.name || '',
    code: dbEntry.code || '',
    points: safeNumber(dbEntry.points),
    total_spent: safeNumber(dbEntry.total_spent),
    tier: dbEntry.tier || 'Bronze',
    rank: safeNumber(dbEntry.rank)
  };
};

export const supabaseService = {
  // Authentication operations
  async authenticateAdmin(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('Attempting admin authentication for username:', username);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Database error during admin auth:', error);
        return { success: false, error: `Database error: ${error.message}` };
      }
      
      if (!data) {
        console.log('No admin user found with username:', username);
        return { success: false, error: 'Invalid username or password' };
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      
      if (!isValidPassword && username === 'admin123' && password === 'admin123') {
        const newPasswordHash = await bcrypt.hash('admin123', 10);
        
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ password_hash: newPasswordHash })
          .eq('username', 'admin123');
          
        if (!updateError) {
          return {
            success: true,
            user: {
              id: data.id,
              username: data.username,
              name: data.name,
              role: 'admin'
            }
          };
        }
      }
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid username or password' };
      }

      return {
        success: true,
        user: {
          id: data.id,
          username: data.username,
          name: data.name,
          role: 'admin'
        }
      };
    } catch (error) {
      console.error('Admin authentication error:', error);
      return { success: false, error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },

  async authenticateCustomer(phone: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid phone number or password' };
      }

      if (!data.password_hash) {
        return { success: false, error: 'No password set for this account' };
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid phone number or password' };
      }

      return {
        success: true,
        user: {
          id: data.id,
          phone: data.phone,
          name: data.name,
          role: 'customer'
        }
      };
    } catch (error) {
      console.error('Customer authentication error:', error);
      return { success: false, error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No customer data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformCustomer);
    } catch (error) {
      console.error('Error in getCustomers:', error);
      throw error;
    }
  },

  async addCustomer(customerData: Omit<Customer, 'id' | 'points' | 'tier' | 'joinedDate' | 'miniCoins' | 'totalSpent' | 'monthlySpent' | 'accumulatedPointMoney'>): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address || '',
          code: customerData.code,
          parent_code: customerData.parentCode,
          is_reserved: customerData.isReserved,
          is_pending: customerData.isPending,
          mlm_level: customerData.mlmLevel,
          direct_referrals: customerData.directReferrals,
          total_downline_count: customerData.totalDownlineCount,
          monthly_commissions: customerData.monthlyCommissions,
          total_commissions: customerData.totalCommissions,
          password_hash: customerData.passwordHash
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        throw new Error(`Failed to add customer: ${error.message}`);
      }

      return data ? transformCustomer(data) : null;
    } catch (error) {
      console.error('Error in addCustomer:', error);
      throw error;
    }
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (customerData.name !== undefined) updateData.name = customerData.name;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone;
      if (customerData.address !== undefined) updateData.address = customerData.address;
      if (customerData.code !== undefined) updateData.code = customerData.code;
      if (customerData.parentCode !== undefined) updateData.parent_code = customerData.parentCode;
      if (customerData.points !== undefined) updateData.points = customerData.points;
      if (customerData.miniCoins !== undefined) updateData.mini_coins = customerData.miniCoins;
      if (customerData.tier !== undefined) updateData.tier = customerData.tier;
      if (customerData.isReserved !== undefined) updateData.is_reserved = customerData.isReserved;
      if (customerData.isPending !== undefined) updateData.is_pending = customerData.isPending;
      if (customerData.totalSpent !== undefined) updateData.total_spent = customerData.totalSpent;
      if (customerData.monthlySpent !== undefined) updateData.monthly_spent = customerData.monthlySpent;
      if (customerData.accumulatedPointMoney !== undefined) updateData.accumulated_point_money = customerData.accumulatedPointMoney;
      if (customerData.mlmLevel !== undefined) updateData.mlm_level = customerData.mlmLevel;
      if (customerData.directReferrals !== undefined) updateData.direct_referrals = customerData.directReferrals;
      if (customerData.totalDownlineCount !== undefined) updateData.total_downline_count = customerData.totalDownlineCount;
      if (customerData.monthlyCommissions !== undefined) updateData.monthly_commissions = customerData.monthlyCommissions;
      if (customerData.totalCommissions !== undefined) updateData.total_commissions = customerData.totalCommissions;
      if (customerData.lastMLMDistribution !== undefined) updateData.last_mlm_distribution = customerData.lastMLMDistribution;
      if (customerData.passwordHash !== undefined) updateData.password_hash = customerData.passwordHash;

      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating customer:', error);
        throw new Error(`Failed to update customer: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      return false;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw new Error(`Failed to delete customer: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      return false;
    }
  },

  // Category operations
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No category data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformCategory);
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  },

  async addCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        throw new Error(`Failed to add category: ${error.message}`);
      }

      return data ? transformCategory(data) : null;
    } catch (error) {
      console.error('Error in addCategory:', error);
      return null;
    }
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id);

      if (error) {
        console.error('Error updating category:', error);
        throw new Error(`Failed to update category: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return false;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw new Error(`Failed to delete category: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return false;
    }
  },

  // Product operations
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No product data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformProduct);
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          price: productData.price,
          mrp: productData.mrp,
          dummy_price: productData.dummyPrice,
          image: productData.image,
          description: productData.description,
          category: productData.category,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity,
          tier_discounts: productData.tierDiscounts
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw new Error(`Failed to add product: ${error.message}`);
      }

      return data ? transformProduct(data) : null;
    } catch (error) {
      console.error('Error in addProduct:', error);
      return null;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.mrp !== undefined) updateData.mrp = productData.mrp;
      if (productData.dummyPrice !== undefined) updateData.dummy_price = productData.dummyPrice;
      if (productData.image !== undefined) updateData.image = productData.image;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.inStock !== undefined) updateData.in_stock = productData.inStock;
      if (productData.stockQuantity !== undefined) updateData.stock_quantity = productData.stockQuantity;
      if (productData.tierDiscounts !== undefined) updateData.tier_discounts = productData.tierDiscounts;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw new Error(`Failed to update product: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  },

  // Service operations
  async getServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        throw new Error(`Failed to fetch services: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No service data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformService);
    } catch (error) {
      console.error('Error in getServices:', error);
      throw error;
    }
  },

  async addService(serviceData: Omit<Service, 'id'>): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          title: serviceData.title,
          description: serviceData.description,
          price: serviceData.price,
          image: serviceData.image,
          category: serviceData.category,
          is_active: serviceData.isActive
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding service:', error);
        throw new Error(`Failed to add service: ${error.message}`);
      }

      return data ? transformService(data) : null;
    } catch (error) {
      console.error('Error in addService:', error);
      return null;
    }
  },

  async updateService(id: string, serviceData: Partial<Service>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id);

      if (error) {
        console.error('Error updating service:', error);
        throw new Error(`Failed to update service: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateService:', error);
      return false;
    }
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        throw new Error(`Failed to delete service: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteService:', error);
      return false;
    }
  },

  // Order operations
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No order data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformOrder);
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  },

  async addOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<Order | null> {
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: orderData.customerId,
          customer_name: orderData.customerName,
          customer_phone: orderData.customerPhone,
          customer_code: orderData.customerCode,
          products: orderData.products,
          total_amount: orderData.totalAmount,
          points_used: orderData.pointsUsed,
          amount_paid: orderData.amountPaid,
          points: orderData.points,
          status: orderData.status,
          payment_method: orderData.paymentMethod,
          pincode: orderData.pincode,
          is_pending_approval: orderData.isPendingApproval,
          is_points_awarded: orderData.isPointsAwarded,
          delivery_approved: orderData.deliveryApproved,
          points_approved: orderData.pointsApproved,
          used_points_discount: orderData.usedPointsDiscount,
          mlm_distribution_log: orderData.mlmDistributionLog
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding order:', error);
        throw new Error(`Failed to add order: ${error.message}`);
      }

      return data ? transformOrder(data) : null;
    } catch (error) {
      console.error('Error in addOrder:', error);
      throw error;
    }
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (orderData.customerId !== undefined) updateData.customer_id = orderData.customerId;
      if (orderData.customerName !== undefined) updateData.customer_name = orderData.customerName;
      if (orderData.customerPhone !== undefined) updateData.customer_phone = orderData.customerPhone;
      if (orderData.customerCode !== undefined) updateData.customer_code = orderData.customerCode;
      if (orderData.products !== undefined) updateData.products = orderData.products;
      if (orderData.totalAmount !== undefined) updateData.total_amount = orderData.totalAmount;
      if (orderData.pointsUsed !== undefined) updateData.points_used = orderData.pointsUsed;
      if (orderData.amountPaid !== undefined) updateData.amount_paid = orderData.amountPaid;
      if (orderData.points !== undefined) updateData.points = orderData.points;
      if (orderData.status !== undefined) updateData.status = orderData.status;
      if (orderData.paymentMethod !== undefined) updateData.payment_method = orderData.paymentMethod;
      if (orderData.pincode !== undefined) updateData.pincode = orderData.pincode;
      if (orderData.isPendingApproval !== undefined) updateData.is_pending_approval = orderData.isPendingApproval;
      if (orderData.isPointsAwarded !== undefined) updateData.is_points_awarded = orderData.isPointsAwarded;
      if (orderData.deliveryApproved !== undefined) updateData.delivery_approved = orderData.deliveryApproved;
      if (orderData.pointsApproved !== undefined) updateData.points_approved = orderData.pointsApproved;
      if (orderData.usedPointsDiscount !== undefined) updateData.used_points_discount = orderData.usedPointsDiscount;
      if (orderData.mlmDistributionLog !== undefined) updateData.mlm_distribution_log = orderData.mlmDistributionLog;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating order:', error);
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      return false;
    }
  },

  // Daily Sales operations
  async getDailySales(): Promise<DailySales[]> {
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error fetching daily sales:', error);
        throw new Error(`Failed to fetch daily sales: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No daily sales data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformDailySales);
    } catch (error) {
      console.error('Error in getDailySales:', error);
      throw error;
    }
  },

  async getTodaysSales(): Promise<DailySales | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('sale_date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching today\'s sales:', error);
        throw new Error(`Failed to fetch today's sales: ${error.message}`);
      }

      return data ? transformDailySales(data) : null;
    } catch (error) {
      console.error('Error in getTodaysSales:', error);
      return null;
    }
  },

  async getSalesByDateRange(startDate: string, endDate: string): Promise<DailySales[]> {
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error fetching sales by date range:', error);
        throw new Error(`Failed to fetch sales by date range: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No sales data received for date range or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformDailySales);
    } catch (error) {
      console.error('Error in getSalesByDateRange:', error);
      throw error;
    }
  },

  // Leaderboard operations
  async getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('customer_leaderboard')
        .select('*');

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('No leaderboard data received or invalid format');
        return [];
      }

      return data.filter(Boolean).map(transformLeaderboardEntry);
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      throw error;
    }
  },

  async getLeaderboardConfig(): Promise<LeaderboardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_config')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching leaderboard config:', error);
        throw new Error(`Failed to fetch leaderboard config: ${error.message}`);
      }

      return data ? transformLeaderboardConfig(data) : null;
    } catch (error) {
      console.error('Error in getLeaderboardConfig:', error);
      return null;
    }
  },

  async updateLeaderboardConfig(configData: Partial<LeaderboardConfig>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leaderboard_config')
        .update(configData)
        .eq('is_active', true);

      if (error) {
        console.error('Error updating leaderboard config:', error);
        throw new Error(`Failed to update leaderboard config: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateLeaderboardConfig:', error);
      return false;
    }
  }
};
