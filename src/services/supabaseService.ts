import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import bcrypt from 'bcryptjs';

// Define types for your tables
type Customer = Database['public']['Tables']['customers']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type AdminUser = Database['public']['Tables']['admin_users']['Row'];

// Transform database customer to application Customer type
const transformCustomer = (dbCustomer: any): Customer => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  phone: dbCustomer.phone,
  address: dbCustomer.address || '', // Add address field
  code: dbCustomer.code,
  parentCode: dbCustomer.parent_code,
  points: dbCustomer.points,
  miniCoins: dbCustomer.mini_coins,
  tier: dbCustomer.tier,
  joinedDate: dbCustomer.joined_date,
  isReserved: dbCustomer.is_reserved,
  isPending: dbCustomer.is_pending,
  totalSpent: Number(dbCustomer.total_spent),
  monthlySpent: dbCustomer.monthly_spent || {},
  accumulatedPointMoney: Number(dbCustomer.accumulated_point_money),
  mlmLevel: dbCustomer.mlm_level,
  directReferrals: dbCustomer.direct_referrals || [],
  totalDownlineCount: dbCustomer.total_downline_count,
  monthlyCommissions: dbCustomer.monthly_commissions || {},
  totalCommissions: Number(dbCustomer.total_commissions),
  lastMLMDistribution: dbCustomer.last_mlm_distribution
});

// Transform application Customer to database format
const transformCustomerToDb = (customer: Omit<Customer, 'id' | 'points' | 'tier' | 'joinedDate' | 'miniCoins' | 'totalSpent' | 'monthlySpent' | 'accumulatedPointMoney'>): any => ({
  name: customer.name,
  phone: customer.phone,
  address: customer.address || '', // Add address field
  code: customer.code,
  parent_code: customer.parentCode || null,
  is_reserved: customer.isReserved,
  is_pending: customer.isPending,
  mlm_level: customer.mlmLevel,
  direct_referrals: customer.directReferrals || [],
  total_downline_count: customer.totalDownlineCount,
  monthly_commissions: customer.monthlyCommissions || {},
  total_commissions: customer.totalCommissions,
  last_mlm_distribution: customer.lastMLMDistribution || null,
  password_hash: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  accumulated_point_money: 0
});

const transformCategory = (dbCategory: Category) => ({
  id: dbCategory.id,
  name: dbCategory.name,
  description: dbCategory.description,
  createdAt: dbCategory.created_at,
  updatedAt: dbCategory.updated_at
});

const transformProduct = (dbProduct: Product) => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: Number(dbProduct.price),
  mrp: Number(dbProduct.mrp),
  dummyPrice: dbProduct.dummy_price ? Number(dbProduct.dummy_price) : undefined,
  image: dbProduct.image,
  description: dbProduct.description,
  category: dbProduct.category,
  inStock: dbProduct.in_stock,
  stockQuantity: dbProduct.stock_quantity,
  tierDiscounts: (dbProduct.tier_discounts as { Bronze: number; Silver: number; Gold: number; Diamond: number }) || {
    Bronze: 2,
    Silver: 3,
    Gold: 4,
    Diamond: 5
  }
});

const transformService = (dbService: Service) => ({
  id: dbService.id,
  title: dbService.title,
  description: dbService.description,
  price: dbService.price,
  image: dbService.image,
  category: dbService.category,
  isActive: dbService.is_active
});

const transformOrder = (dbOrder: Order) => ({
  id: dbOrder.id,
  customerId: dbOrder.customer_id,
  customerName: dbOrder.customer_name,
  customerPhone: dbOrder.customer_phone,
  customerCode: dbOrder.customer_code,
  products: (dbOrder.products as any[]) || [],
  totalAmount: Number(dbOrder.total_amount),
  pointsUsed: dbOrder.points_used,
  amountPaid: Number(dbOrder.amount_paid),
  points: dbOrder.points,
  status: dbOrder.status as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded",
  paymentMethod: dbOrder.payment_method as "cod" | "upi",
  pincode: dbOrder.pincode,
  orderDate: dbOrder.order_date,
  isPendingApproval: dbOrder.is_pending_approval,
  isPointsAwarded: dbOrder.is_points_awarded,
  deliveryApproved: dbOrder.delivery_approved,
  pointsApproved: dbOrder.points_approved,
  usedPointsDiscount: dbOrder.used_points_discount,
  mlmDistributionLog: (dbOrder.mlm_distribution_log as string[]) || []
});

// Authentication methods
const authenticateCustomer = async (phone: string, password: string) => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !customers) {
      return { success: false, error: 'Phone number not found' };
    }

    if (!customers.password_hash) {
      return { success: false, error: 'Please set up your password' };
    }

    const isValidPassword = await bcrypt.compare(password, customers.password_hash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    const transformedCustomer = transformCustomer(customers);
    
    return {
      success: true,
      user: {
        id: transformedCustomer.id,
        name: transformedCustomer.name,
        phone: transformedCustomer.phone,
        role: 'customer'
      }
    };
  } catch (error) {
    console.error('Customer authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

const authenticateAdmin = async (username: string, password: string) => {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return { success: false, error: 'Username not found' };
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    return {
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Customer methods
const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return (data || []).map(transformCustomer);
};

const addCustomer = async (customerData: any) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name: customerData.name,
      phone: customerData.phone,
      code: customerData.code,
      parent_code: customerData.parentCode,
      is_reserved: customerData.isReserved,
      is_pending: customerData.isPending,
      password_hash: customerData.passwordHash,
      mlm_level: customerData.mlmLevel,
      direct_referrals: customerData.directReferrals,
      total_downline_count: customerData.totalDownlineCount,
      monthly_commissions: customerData.monthlyCommissions,
      total_commissions: customerData.totalCommissions
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding customer:", error);
    return null;
  }

  return data ? transformCustomer(data) : null;
};

const updateCustomer = async (id: string, customerData: any): Promise<boolean> => {
  const updateData: any = {};
  
  if (customerData.points !== undefined) updateData.points = customerData.points;
  if (customerData.miniCoins !== undefined) updateData.mini_coins = customerData.miniCoins;
  if (customerData.tier !== undefined) updateData.tier = customerData.tier;
  if (customerData.parentCode !== undefined) updateData.parent_code = customerData.parentCode;
  if (customerData.totalSpent !== undefined) updateData.total_spent = customerData.totalSpent;
  if (customerData.monthlySpent !== undefined) updateData.monthly_spent = customerData.monthlySpent;
  if (customerData.accumulatedPointMoney !== undefined) updateData.accumulated_point_money = customerData.accumulatedPointMoney;
  if (customerData.lastMLMDistribution !== undefined) updateData.last_mlm_distribution = customerData.lastMLMDistribution;
  if (customerData.mlmLevel !== undefined) updateData.mlm_level = customerData.mlmLevel;
  if (customerData.directReferrals !== undefined) updateData.direct_referrals = customerData.directReferrals;
  if (customerData.totalDownlineCount !== undefined) updateData.total_downline_count = customerData.totalDownlineCount;
  if (customerData.monthlyCommissions !== undefined) updateData.monthly_commissions = customerData.monthlyCommissions;
  if (customerData.totalCommissions !== undefined) updateData.total_commissions = customerData.totalCommissions;

  const { error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    return false;
  }

  return true;
};

const deleteCustomer = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting customer with id ${id}:`, error);
    return false;
  }

  return true;
};

// Category methods
const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []).map(transformCategory);
};

const addCategory = async (categoryData: any) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    return null;
  }

  return data ? transformCategory(data) : null;
};

const updateCategory = async (id: string, categoryData: any): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id);

  if (error) {
    console.error(`Error updating category with id ${id}:`, error);
    return false;
  }

  return true;
};

const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    return false;
  }

  return true;
};

// Product methods
const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data || []).map(transformProduct);
};

const addProduct = async (productData: any) => {
  try {
    console.log('supabaseService.addProduct called with:', productData);
    
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
      console.error('Supabase error adding product:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned from product insert');
      throw new Error('No data returned from product insert');
    }

    console.log('Product successfully added to database:', data);
    return transformProduct(data);
  } catch (error) {
    console.error('Error in supabaseService.addProduct:', error);
    throw error;
  }
};

const updateProduct = async (id: string, productData: any): Promise<boolean> => {
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
    console.error(`Error updating product with id ${id}:`, error);
    return false;
  }

  return true;
};

const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    return false;
  }

  return true;
};

// Service methods
const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return (data || []).map(transformService);
};

const addService = async (serviceData: any) => {
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
    console.error("Error adding service:", error);
    return null;
  }

  return data ? transformService(data) : null;
};

const updateService = async (id: string, serviceData: any): Promise<boolean> => {
  const updateData: any = {};
  
  if (serviceData.title !== undefined) updateData.title = serviceData.title;
  if (serviceData.description !== undefined) updateData.description = serviceData.description;
  if (serviceData.price !== undefined) updateData.price = serviceData.price;
  if (serviceData.image !== undefined) updateData.image = serviceData.image;
  if (serviceData.category !== undefined) updateData.category = serviceData.category;
  if (serviceData.isActive !== undefined) updateData.is_active = serviceData.isActive;

  const { error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error(`Error updating service with id ${id}:`, error);
    return false;
  }

  return true;
};

const deleteService = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting service with id ${id}:`, error);
    return false;
  }

  return true;
};

// Order methods
const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return (data || []).map(transformOrder);
};

const addOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      id: orderData.id || crypto.randomUUID(),
      customer_id: orderData.customerId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_code: orderData.customerCode,
      products: orderData.products,
      total_amount: orderData.totalAmount,
      points_used: orderData.pointsUsed,
      amount_paid: orderData.amountPaid,
      points: orderData.points,
      status: orderData.status || 'pending',
      payment_method: orderData.paymentMethod,
      pincode: orderData.pincode,
      order_date: new Date().toISOString(),
      mlm_distribution_log: orderData.mlmDistributionLog || []
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding order:", error);
    return null;
  }

  return data ? transformOrder(data) : null;
};

const updateOrder = async (id: string, orderData: any): Promise<boolean> => {
  const updateData: any = {};
  
  if (orderData.status !== undefined) updateData.status = orderData.status;
  if (orderData.isPointsAwarded !== undefined) updateData.is_points_awarded = orderData.isPointsAwarded;
  if (orderData.deliveryApproved !== undefined) updateData.delivery_approved = orderData.deliveryApproved;
  if (orderData.mlmDistributionLog !== undefined) updateData.mlm_distribution_log = orderData.mlmDistributionLog;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error(`Error updating order with id ${id}:`, error);
    return false;
  }

  return true;
};

export const supabaseService = {
  // Authentication methods
  authenticateCustomer,
  authenticateAdmin,
  
  // Customer methods
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Category methods
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  
  // Product methods
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  
  // Service methods
  getServices,
  addService,
  updateService,
  deleteService,
  
  // Order methods
  getOrders,
  addOrder,
  updateOrder,
};

export { addProduct };
