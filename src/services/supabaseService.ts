
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product, Service, Order, Offer } from '@/contexts/DataContext';

export class SupabaseService {
  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    
    return data.map(this.mapCustomerFromDB);
  }

  async addCustomer(customer: Omit<Customer, "id" | "joinedDate" | "points" | "miniCoins" | "tier" | "totalSpent" | "monthlySpent" | "accumulatedPointMoney">): Promise<Customer | null> {
    const dbCustomer = {
      name: customer.name,
      phone: customer.phone,
      code: customer.code,
      parent_code: customer.parentCode,
      is_reserved: customer.isReserved || false,
      is_pending: customer.isPending || false,
      password_hash: customer.passwordHash,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([dbCustomer])
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      return null;
    }

    return this.mapCustomerFromDB(data);
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<boolean> {
    const dbCustomer = this.mapCustomerToDB(customerData);
    
    const { error } = await supabase
      .from('customers')
      .update(dbCustomer)
      .eq('id', id);

    if (error) {
      console.error('Error updating customer:', error);
      return false;
    }

    return true;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return false;
    }

    return true;
  }

  // Customer authentication
  async authenticateCustomer(phone: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid phone number or password' };
    }

    // For now, we'll use simple password comparison
    // In production, you'd use bcrypt to compare hashed passwords
    const bcrypt = await import('bcryptjs');
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
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data.map(this.mapProductFromDB);
  }

  async addProduct(product: Omit<Product, "id">): Promise<Product | null> {
    const dbProduct = {
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      dummy_price: product.dummyPrice,
      image: product.image,
      description: product.description,
      category: product.category,
      in_stock: product.inStock,
      stock_quantity: product.stockQuantity,
      tier_discounts: product.tierDiscounts,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    return this.mapProductFromDB(data);
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
    const dbProduct = this.mapProductToDB(productData);
    
    const { error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      return false;
    }

    return true;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    
    return data.map(this.mapServiceFromDB);
  }

  async addService(service: Omit<Service, "id">): Promise<Service | null> {
    const dbService = {
      title: service.title,
      description: service.description,
      price: service.price,
      image: service.image,
      category: service.category,
      is_active: service.isActive,
    };

    const { data, error } = await supabase
      .from('services')
      .insert([dbService])
      .select()
      .single();

    if (error) {
      console.error('Error adding service:', error);
      return null;
    }

    return this.mapServiceFromDB(data);
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<boolean> {
    const dbService = this.mapServiceToDB(serviceData);
    
    const { error } = await supabase
      .from('services')
      .update(dbService)
      .eq('id', id);

    if (error) {
      console.error('Error updating service:', error);
      return false;
    }

    return true;
  }

  async deleteService(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return false;
    }

    return true;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    return data.map(this.mapOrderFromDB);
  }

  async addOrder(order: Omit<Order, "id" | "orderDate" | "isPendingApproval" | "isPointsAwarded" | "deliveryApproved" | "pointsApproved">): Promise<Order | null> {
    const orderId = `ORD${Math.floor(10000 + Math.random() * 90000)}`;
    
    console.log(`Creating order ${orderId} with ${order.points} point money`);
    
    const dbOrder = {
      id: orderId,
      customer_id: order.customerId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_code: order.customerCode,
      products: order.products,
      total_amount: order.totalAmount,
      points_used: order.pointsUsed,
      amount_paid: order.amountPaid,
      points: order.points, // Use the calculated points from the order
      status: order.status,
      payment_method: order.paymentMethod,
      pincode: order.pincode,
      is_pending_approval: true,
      is_points_awarded: false,
      delivery_approved: false,
      points_approved: false,
      used_points_discount: order.usedPointsDiscount,
      mlm_distribution_log: order.mlmDistributionLog || [],
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([dbOrder])
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
      return null;
    }

    console.log(`Order ${orderId} created successfully with ${data.points} point money`);
    return this.mapOrderFromDB(data);
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<boolean> {
    const dbOrder = this.mapOrderToDB(orderData);
    
    const { error } = await supabase
      .from('orders')
      .update(dbOrder)
      .eq('id', id);

    if (error) {
      console.error('Error updating order:', error);
      return false;
    }

    return true;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      return false;
    }

    return true;
  }

  // Admin authentication
  async authenticateAdmin(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        console.error('Admin not found:', error);
        return { success: false, error: 'Invalid username or password' };
      }

      // For the default admin, check direct password match first
      if (username === 'admin123' && password === 'admin123') {
        return { 
          success: true, 
          user: { 
            id: data.id, 
            username: data.username, 
            name: data.name, 
            role: data.role 
          } 
        };
      }

      // For other cases, use bcrypt comparison
      try {
        const bcrypt = await import('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, data.password_hash);

        if (!isValidPassword) {
          return { success: false, error: 'Invalid username or password' };
        }

        return { 
          success: true, 
          user: { 
            id: data.id, 
            username: data.username, 
            name: data.name, 
            role: data.role 
          } 
        };
      } catch (bcryptError) {
        console.error('Bcrypt error:', bcryptError);
        return { success: false, error: 'Authentication error' };
      }
    } catch (error) {
      console.error('Admin authentication error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  // Mapping functions
  private mapCustomerFromDB(data: any): Customer {
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      code: data.code,
      points: data.points,
      miniCoins: data.mini_coins,
      tier: data.tier as Customer['tier'],
      parentCode: data.parent_code,
      joinedDate: data.joined_date,
      isReserved: data.is_reserved,
      isPending: data.is_pending,
      totalSpent: parseFloat(data.total_spent),
      monthlySpent: data.monthly_spent || {},
      accumulatedPointMoney: parseFloat(data.accumulated_point_money),
      lastMLMDistribution: data.last_mlm_distribution,
      passwordHash: data.password_hash,
    };
  }

  private mapCustomerToDB(customer: Partial<Customer>): any {
    const dbCustomer: any = {};
    
    if (customer.name !== undefined) dbCustomer.name = customer.name;
    if (customer.phone !== undefined) dbCustomer.phone = customer.phone;
    if (customer.code !== undefined) dbCustomer.code = customer.code;
    if (customer.points !== undefined) dbCustomer.points = customer.points;
    if (customer.miniCoins !== undefined) dbCustomer.mini_coins = customer.miniCoins;
    if (customer.tier !== undefined) dbCustomer.tier = customer.tier;
    if (customer.parentCode !== undefined) dbCustomer.parent_code = customer.parentCode;
    if (customer.isReserved !== undefined) dbCustomer.is_reserved = customer.isReserved;
    if (customer.isPending !== undefined) dbCustomer.is_pending = customer.isPending;
    if (customer.totalSpent !== undefined) dbCustomer.total_spent = customer.totalSpent;
    if (customer.monthlySpent !== undefined) dbCustomer.monthly_spent = customer.monthlySpent;
    if (customer.accumulatedPointMoney !== undefined) dbCustomer.accumulated_point_money = customer.accumulatedPointMoney;
    if (customer.lastMLMDistribution !== undefined) dbCustomer.last_mlm_distribution = customer.lastMLMDistribution;
    if (customer.passwordHash !== undefined) dbCustomer.password_hash = customer.passwordHash;
    
    return dbCustomer;
  }

  private mapProductFromDB(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      mrp: parseFloat(data.mrp),
      dummyPrice: data.dummy_price ? parseFloat(data.dummy_price) : undefined,
      image: data.image,
      description: data.description,
      category: data.category,
      inStock: data.in_stock,
      stockQuantity: data.stock_quantity || 0,
      tierDiscounts: data.tier_discounts,
    };
  }

  private mapProductToDB(product: Partial<Product>): any {
    const dbProduct: any = {};
    
    if (product.name !== undefined) dbProduct.name = product.name;
    if (product.price !== undefined) dbProduct.price = product.price;
    if (product.mrp !== undefined) dbProduct.mrp = product.mrp;
    if (product.dummyPrice !== undefined) dbProduct.dummy_price = product.dummyPrice;
    if (product.image !== undefined) dbProduct.image = product.image;
    if (product.description !== undefined) dbProduct.description = product.description;
    if (product.category !== undefined) dbProduct.category = product.category;
    if (product.inStock !== undefined) dbProduct.in_stock = product.inStock;
    if (product.stockQuantity !== undefined) dbProduct.stock_quantity = product.stockQuantity;
    if (product.tierDiscounts !== undefined) dbProduct.tier_discounts = product.tierDiscounts;
    
    return dbProduct;
  }

  private mapServiceFromDB(data: any): Service {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      isActive: data.is_active,
    };
  }

  private mapServiceToDB(service: Partial<Service>): any {
    const dbService: any = {};
    
    if (service.title !== undefined) dbService.title = service.title;
    if (service.description !== undefined) dbService.description = service.description;
    if (service.price !== undefined) dbService.price = service.price;
    if (service.image !== undefined) dbService.image = service.image;
    if (service.category !== undefined) dbService.category = service.category;
    if (service.isActive !== undefined) dbService.is_active = service.isActive;
    
    return dbService;
  }

  private mapOrderFromDB(data: any): Order {
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerCode: data.customer_code,
      products: data.products,
      totalAmount: parseFloat(data.total_amount),
      pointsUsed: data.points_used,
      amountPaid: parseFloat(data.amount_paid),
      points: data.points,
      status: data.status,
      paymentMethod: data.payment_method,
      pincode: data.pincode,
      orderDate: data.order_date,
      isPendingApproval: data.is_pending_approval,
      isPointsAwarded: data.is_points_awarded,
      deliveryApproved: data.delivery_approved,
      pointsApproved: data.points_approved,
      usedPointsDiscount: data.used_points_discount,
      mlmDistributionLog: data.mlm_distribution_log,
    };
  }

  private mapOrderToDB(order: Partial<Order>): any {
    const dbOrder: any = {};
    
    if (order.customerId !== undefined) dbOrder.customer_id = order.customerId;
    if (order.customerName !== undefined) dbOrder.customer_name = order.customerName;
    if (order.customerPhone !== undefined) dbOrder.customer_phone = order.customerPhone;
    if (order.customerCode !== undefined) dbOrder.customer_code = order.customerCode;
    if (order.products !== undefined) dbOrder.products = order.products;
    if (order.totalAmount !== undefined) dbOrder.total_amount = order.totalAmount;
    if (order.pointsUsed !== undefined) dbOrder.points_used = order.pointsUsed;
    if (order.amountPaid !== undefined) dbOrder.amount_paid = order.amountPaid;
    if (order.points !== undefined) dbOrder.points = order.points;
    if (order.status !== undefined) dbOrder.status = order.status;
    if (order.paymentMethod !== undefined) dbOrder.payment_method = order.paymentMethod;
    if (order.pincode !== undefined) dbOrder.pincode = order.pincode;
    if (order.isPendingApproval !== undefined) dbOrder.is_pending_approval = order.isPendingApproval;
    if (order.isPointsAwarded !== undefined) dbOrder.is_points_awarded = order.isPointsAwarded;
    if (order.deliveryApproved !== undefined) dbOrder.delivery_approved = order.deliveryApproved;
    if (order.pointsApproved !== undefined) dbOrder.points_approved = order.pointsApproved;
    if (order.usedPointsDiscount !== undefined) dbOrder.used_points_discount = order.usedPointsDiscount;
    if (order.mlmDistributionLog !== undefined) dbOrder.mlm_distribution_log = order.mlmDistributionLog;
    
    return dbOrder;
  }
}

export const supabaseService = new SupabaseService();
