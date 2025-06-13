import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Define types for your tables
type Customer = Database['public']['Tables']['customers']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

// Customer methods
const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return data || [];
};

const addCustomer = async (customerData: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) {
    console.error("Error adding customer:", error);
    return null;
  }

  return data;
};

const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
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
const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
};

const addCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    return null;
  }

  return data;
};

const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<boolean> => {
  const { data, error } = await supabase
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

export const addProduct = async (productData: any) => {
  try {
    console.log('supabaseService.addProduct called with:', productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
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
    return data;
  } catch (error) {
    console.error('Error in supabaseService.addProduct:', error);
    throw error;
  }
};

// Product methods
const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
};

const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
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
const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data || [];
};

const addService = async (serviceData: Omit<Service, "id">): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single();

  if (error) {
    console.error("Error adding service:", error);
    return null;
  }

  return data;
};

const updateService = async (id: string, serviceData: Partial<Service>): Promise<boolean> => {
  const { data, error } = await supabase
    .from('services')
    .update(serviceData)
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
const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('orderDate', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data || [];
};

const addOrder = async (orderData: Omit<Order, "id" | "orderDate" | "points" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        ...orderData,
        orderDate: new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding order:", error);
    return null;
  }

  return data;
};

const updateOrder = async (id: string, orderData: Partial<Order>): Promise<boolean> => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      ...orderData
    })
    .eq('id', id);

  if (error) {
    console.error(`Error updating order with id ${id}:`, error);
    return false;
  }

  return true;
};

export const supabaseService = {
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
