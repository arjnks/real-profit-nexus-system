
import { supabase } from '@/integrations/supabase/client';
import type { Customer, Product, Category, Service, Order, User, DailySales, LeaderboardConfig } from '@/types';

// Timeout utility  
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs);
    })
  ]);
};

// Test functions for connection
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await withTimeout(
      supabase.from('customers').select('count').limit(1),
      5000
    );
    
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    
    console.log('Connection test successful');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
};

// Customer functions with snake_case field names
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    console.log('Fetching customers from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} customers`);
    return data.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      code: customer.code,
      parent_code: customer.parent_code,
      points: customer.points || 0,
      tier: customer.tier as "Bronze" | "Silver" | "Gold" | "Diamond",
      joined_date: customer.joined_date,
      is_reserved: customer.is_reserved || false,
      is_pending: customer.is_pending || false,
      total_spent: customer.total_spent || 0,
      monthly_spent: customer.monthly_spent || {},
      accumulated_point_money: customer.accumulated_point_money || 0,
      password_hash: customer.password_hash
    }));
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw error;
  }
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  try {
    console.log('Adding customer to Supabase:', customer);
    
    const { data, error } = await withTimeout(
      supabase
        .from('customers')
        .insert([customer])
        .select('*')
        .single()
    );

    if (error) {
      console.error('Error adding customer:', error);
      throw new Error(`Failed to add customer: ${error.message}`);
    }

    console.log('Customer added successfully:', data);
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      address: data.address || '',
      code: data.code,
      parent_code: data.parent_code,
      points: data.points || 0,
      tier: data.tier as "Bronze" | "Silver" | "Gold" | "Diamond",
      joined_date: data.joined_date,
      is_reserved: data.is_reserved || false,
      is_pending: data.is_pending || false,
      total_spent: data.total_spent || 0,
      monthly_spent: data.monthly_spent || {},
      accumulated_point_money: data.accumulated_point_money || 0,
      password_hash: data.password_hash
    };
  } catch (error) {
    console.error('Failed to add customer:', error);
    return null;
  }
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
  try {
    console.log(`Updating customer ${id}:`, updates);
    
    const { error } = await withTimeout(
      supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
    );

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    console.log('Customer updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update customer:', error);
    return false;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting customer ${id}`);
    
    const { error } = await withTimeout(
      supabase
        .from('customers')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }

    console.log('Customer deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return false;
  }
};

// Product functions with snake_case field names
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      15000
    );

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('No products found in database');
      throw new Error('Products are taking too long to load. Please try again.');
    }

    console.log(`Successfully fetched ${data.length} products`);
    return data.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      dummy_price: product.dummy_price,
      image: product.image,
      description: product.description,
      category: product.category,
      in_stock: product.in_stock,
      stock_quantity: product.stock_quantity,
      tier_discounts: product.tier_discounts
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    console.log('Adding product to Supabase:', product);
    
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .insert([product])
        .select('*')
        .single()
    );

    if (error) {
      console.error('Error adding product:', error);
      throw new Error(`Failed to add product: ${error.message}`);
    }

    console.log('Product added successfully:', data);
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      mrp: data.mrp,
      dummy_price: data.dummy_price,
      image: data.image,
      description: data.description,
      category: data.category,
      in_stock: data.in_stock,
      stock_quantity: data.stock_quantity,
      tier_discounts: data.tier_discounts
    };
  } catch (error) {
    console.error('Failed to add product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  try {
    console.log(`Updating product ${id}:`, updates);
    
    const { error } = await withTimeout(
      supabase
        .from('products')
        .update(updates)
        .eq('id', id)
    );

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    console.log('Product updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update product:', error);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting product ${id}`);
    
    const { error } = await withTimeout(
      supabase
        .from('products')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    console.log('Product deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
};

// Category functions
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} categories`);
    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
  try {
    console.log('Adding category to Supabase:', category);
    
    const { data, error } = await withTimeout(
      supabase
        .from('categories')
        .insert([category])
        .select('*')
        .single()
    );

    if (error) {
      console.error('Error adding category:', error);
      throw new Error(`Failed to add category: ${error.message}`);
    }

    console.log('Category added successfully:', data);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Failed to add category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
  try {
    console.log(`Updating category ${id}:`, updates);
    
    const { error } = await withTimeout(
      supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
    );

    if (error) {
      console.error('Error updating category:', error);
      throw new Error(`Failed to update category: ${error.message}`);
    }

    console.log('Category updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update category:', error);
    return false;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting category ${id}`);
    
    const { error } = await withTimeout(
      supabase
        .from('categories')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting category:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    console.log('Category deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    return false;
  }
};

// Service functions
export const getServices = async (): Promise<Service[]> => {
  try {
    console.log('Fetching services from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Error fetching services:', error);
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} services`);
    return data.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      image: service.image,
      category: service.category,
      is_active: service.is_active
    }));
  } catch (error) {
    console.error('Failed to fetch services:', error);
    throw error;
  }
};

export const addService = async (service: Omit<Service, 'id'>): Promise<Service | null> => {
  try {
    console.log('Adding service to Supabase:', service);
    
    const { data, error } = await withTimeout(
      supabase
        .from('services')
        .insert([service])
        .select('*')
        .single()
    );

    if (error) {
      console.error('Error adding service:', error);
      throw new Error(`Failed to add service: ${error.message}`);
    }

    console.log('Service added successfully:', data);
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      is_active: data.is_active
    };
  } catch (error) {
    console.error('Failed to add service:', error);
    return null;
  }
};

export const updateService = async (id: string, updates: Partial<Service>): Promise<boolean> => {
  try {
    console.log(`Updating service ${id}:`, updates);
    
    const { error } = await withTimeout(
      supabase
        .from('services')
        .update(updates)
        .eq('id', id)
    );

    if (error) {
      console.error('Error updating service:', error);
      throw new Error(`Failed to update service: ${error.message}`);
    }

    console.log('Service updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update service:', error);
    return false;
  }
};

export const deleteService = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting service ${id}`);
    
    const { error } = await withTimeout(
      supabase
        .from('services')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting service:', error);
      throw new Error(`Failed to delete service: ${error.message}`);
    }

    console.log('Service deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete service:', error);
    return false;
  }
};

// Order functions
export const getOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} orders`);
    return data.map(order => ({
      id: order.id,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_code: order.customer_code,
      products: order.products,
      total_amount: order.total_amount,
      points_used: order.points_used,
      amount_paid: order.amount_paid,
      points: order.points,
      status: order.status,
      payment_method: order.payment_method,
      pincode: order.pincode,
      delivery_address: order.delivery_address,
      order_date: order.order_date,
      is_pending_approval: order.is_pending_approval,
      is_points_awarded: order.is_points_awarded,
      delivery_approved: order.delivery_approved,
      points_approved: order.points_approved
    }));
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

export const addOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
  try {
    console.log('Adding order to Supabase:', order);
    
    const { data, error } = await withTimeout(
      supabase
        .from('orders')
        .insert([order])
        .select('*')
        .single()
    );

    if (error) {
      console.error('Error adding order:', error);
      throw new Error(`Failed to add order: ${error.message}`);
    }

    console.log('Order added successfully:', data);
    return {
      id: data.id,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_code: data.customer_code,
      products: data.products,
      total_amount: data.total_amount,
      points_used: data.points_used,
      amount_paid: data.amount_paid,
      points: data.points,
      status: data.status,
      payment_method: data.payment_method,
      pincode: data.pincode,
      delivery_address: data.delivery_address,
      order_date: data.order_date,
      is_pending_approval: data.is_pending_approval,
      is_points_awarded: data.is_points_awarded,
      delivery_approved: data.delivery_approved,
      points_approved: data.points_approved
    };
  } catch (error) {
    console.error('Failed to add order:', error);
    return null;
  }
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<boolean> => {
  try {
    console.log(`Updating order ${id}:`, updates);
    
    const { error } = await withTimeout(
      supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
    );

    if (error) {
      console.error('Error updating order:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }

    console.log('Order updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update order:', error);
    return false;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    console.log(`Deleting order ${id}`);
    
    const { error } = await withTimeout(
      supabase
        .from('orders')
        .delete()
        .eq('id', id)
    );

    if (error) {
      console.error('Error deleting order:', error);
      throw new Error(`Failed to delete order: ${error.message}`);
    }

    console.log('Order deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete order:', error);
    return false;
  }
};

// Daily sales functions
export const getDailySales = async (): Promise<DailySales[]> => {
  try {
    console.log('Fetching daily sales from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('daily_sales')
        .select('*')
        .order('sale_date', { ascending: false })
    );

    if (error) {
      console.error('Error fetching daily sales:', error);
      throw new Error(`Failed to fetch daily sales: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} daily sales records`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch daily sales:', error);
    throw error;
  }
};

// Leaderboard functions
export const getLeaderboard = async (): Promise<any[]> => {
  try {
    console.log('Fetching leaderboard from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('customer_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
    );

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} leaderboard entries`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error;
  }
};

export const getLeaderboardConfig = async (): Promise<LeaderboardConfig | null> => {
  try {
    console.log('Fetching leaderboard config from Supabase...');
    
    const { data, error } = await withTimeout(
      supabase
        .from('leaderboard_config')
        .select('*')
        .limit(1)
        .single()
    );

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No leaderboard config found');
        return null;
      }
      console.error('Error fetching leaderboard config:', error);
      throw new Error(`Failed to fetch leaderboard config: ${error.message}`);
    }

    console.log('Successfully fetched leaderboard config');
    return data;
  } catch (error) {
    console.error('Failed to fetch leaderboard config:', error);
    throw error;
  }
};

export const updateLeaderboardConfig = async (configData: Partial<LeaderboardConfig>): Promise<void> => {
  try {
    console.log('Updating leaderboard config:', configData);
    
    const { error } = await withTimeout(
      supabase
        .from('leaderboard_config')
        .update(configData)
        .eq('id', 'default')
    );

    if (error) {
      console.error('Error updating leaderboard config:', error);
      throw new Error(`Failed to update leaderboard config: ${error.message}`);
    }

    console.log('Leaderboard config updated successfully');
  } catch (error) {
    console.error('Failed to update leaderboard config:', error);
    throw error;
  }
};

// Admin authentication
export const authenticateAdmin = async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Authenticating admin user...');
    
    // For now, using simple hardcoded admin check
    if (username === 'admin' && password === 'admin123') {
      return {
        success: true,
        user: {
          id: 'admin-1',
          name: 'Admin User',
          username: 'admin',
          role: 'admin'
        }
      };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Failed to authenticate admin:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Customer authentication
export const authenticateCustomer = async (phone: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    console.log('Authenticating customer...');
    
    const { data: customers, error } = await withTimeout(
      supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .limit(1)
    );

    if (error) {
      console.error('Error fetching customer for authentication:', error);
      return { success: false, error: `Authentication failed: ${error.message}` };
    }

    if (!customers || customers.length === 0) {
      console.log('No customer found with phone:', phone);
      return { success: false, error: 'Invalid credentials' };
    }

    const customer = customers[0];
    
    if (!customer.password_hash) {
      console.log('Customer has no password set');
      return { success: false, error: 'Invalid credentials' };
    }

    // For demo purposes, comparing directly (in production, use bcrypt)
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, customer.password_hash);
    
    if (!isValid) {
      console.log('Invalid password for customer');
      return { success: false, error: 'Invalid credentials' };
    }

    console.log('Customer authenticated successfully');
    return {
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        role: 'customer'
      }
    };
  } catch (error) {
    console.error('Failed to authenticate customer:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export default {
  // Connection
  testConnection,
  
  // Customers  
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Products
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  
  // Categories
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Services
  getServices,
  addService,
  updateService,
  deleteService,
  
  // Orders
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  
  // Daily sales
  getDailySales,
  
  // Leaderboard
  getLeaderboard,
  getLeaderboardConfig,
  updateLeaderboardConfig,
  
  // Authentication
  authenticateAdmin,
  authenticateCustomer
};
