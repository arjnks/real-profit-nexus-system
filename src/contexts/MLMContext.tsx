import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId: string) => Promise<void>;
  createDummyCustomers: () => Promise<void>;
  simulatePurchase: (customerCode: string, amount: number) => Promise<void>;
  resetAdminPoints: () => Promise<void>;
  getMLMStructure: (customerCode: string) => any;
  getSlotOccupancy: () => Record<number, { filled: number; capacity: number }>;
}

const MLMContext = createContext<MLMContextType | undefined>(undefined);

export const MLMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addCustomer, updateCustomer, customers, calculatePointsForProduct } = useData();

  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId: string) => {
    console.log(`Starting MLM distribution for customer ${customerCode} with purchase amount ${purchaseAmount}`);

    const customer = customers.find(c => c.code === customerCode);
    if (!customer) {
      console.warn(`Customer ${customerCode} not found. MLM distribution aborted.`);
      return;
    }

    let currentCustomer = customer;
    let level = 1;
    let distributionLog = [`Order ${orderId}: MLM distribution started for ${customerCode} (₹${purchaseAmount})`];

    while (currentCustomer.parentCode && level <= 3) {
      const parent = customers.find(c => c.code === currentCustomer.parentCode);

      if (!parent) {
        console.warn(`Parent ${currentCustomer.parentCode} not found. Stopping distribution at level ${level}.`);
        break;
      }

      const commissionRate = 0.05 / level;
      const commission = purchaseAmount * commissionRate;

      const newPoints = parent.points + Math.floor(commission / 5);
      await updateCustomer(parent.id, { points: newPoints });

      distributionLog.push(`Level ${level}: ${parent.code} earned ₹${commission.toFixed(2)} (${Math.floor(commission / 5)} points)`);

      currentCustomer = parent;
      level++;
    }

    console.log('MLM Distribution Log:', distributionLog);
    toast.success('MLM distribution completed!', {
      description: distributionLog.join('\n'),
    });
  };

  const createDummyCustomers = async () => {
    console.log('Creating dummy customers for MLM demonstration...');
    
    try {
      // Check if customers already exist to avoid duplicates
      const existingCodes = ['C001', 'C002', 'C003', 'C004', 'C005'];
      const existingCustomers = customers.filter(c => existingCodes.includes(c.code));
      
      if (existingCustomers.length > 0) {
        console.log('Some dummy customers already exist, skipping creation');
        toast.info('Dummy customers already exist');
        return;
      }

      // Create customers with unique timestamps to avoid phone conflicts
      const timestamp = Date.now();
      
      await addCustomer({
        name: 'Alice Johnson',
        phone: `987654321${timestamp % 10}`,
        address: '123 Main Street, Mumbai',
        code: 'C001',
        parentCode: 'A100',
        isReserved: false,
        isPending: false,
        mlmLevel: 2,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });

      await addCustomer({
        name: 'Bob Williams',
        phone: `876543210${(timestamp + 1) % 10}`,
        address: '456 Park Avenue, Delhi',
        code: 'C002',
        parentCode: 'C001',
        isReserved: false,
        isPending: false,
        mlmLevel: 3,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });

      await addCustomer({
        name: 'Charlie Brown',
        phone: `765432109${(timestamp + 2) % 10}`,
        address: '789 Gandhi Road, Kolkata',
        code: 'C003',
        parentCode: 'C002',
        isReserved: false,
        isPending: false,
        mlmLevel: 4,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });

      await addCustomer({
        name: 'Diana Davis',
        phone: `654321098${(timestamp + 3) % 10}`,
        address: '101 MG Road, Chennai',
        code: 'C004',
        parentCode: 'C001',
        isReserved: false,
        isPending: false,
        mlmLevel: 3,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });

      await addCustomer({
        name: 'Eve Wilson',
        phone: `543210987${(timestamp + 4) % 10}`,
        address: '222 Linking Road, Bangalore',
        code: 'C005',
        parentCode: 'C004',
        isReserved: false,
        isPending: false,
        mlmLevel: 4,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });
      
      console.log('Successfully created all dummy customers');
      toast.success('Dummy customers created successfully!');
    } catch (error) {
      console.error('Error creating dummy customers:', error);
      toast.error('Some dummy customers may already exist');
    }
  };

  const simulatePurchase = async (customerCode: string, amount: number) => {
    console.log(`Simulating purchase of ${amount} by ${customerCode}`);
    
    try {
      const customer = customers.find(c => c.code === customerCode);
      if (!customer) {
        throw new Error(`Customer with code ${customerCode} not found`);
      }

      const points = Math.floor(amount / 5);

      const newPoints = customer.points + points;
      await updateCustomer(customer.id, { points: newPoints });

      toast.success(`Purchase simulated successfully! ${customer.name} earned ${points} points.`);
    } catch (error) {
      console.error('Error simulating purchase:', error);
      throw error;
    }
  };

  const resetAdminPoints = async () => {
    console.log('Resetting admin A100 points to 0');
    
    try {
      const admin = customers.find(c => c.code === 'A100');
      if (!admin) {
        throw new Error('Admin A100 not found');
      }
      
      await updateCustomer(admin.id, { points: 0, miniCoins: 0, tier: 'Bronze' });
      toast.success('Admin A100 points reset to 0');
    } catch (error) {
      console.error('Error resetting admin points:', error);
      throw error;
    }
  };

  const getMLMStructure = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return null;

    const buildStructure = (code: string, level = 0): any => {
      const current = customers.find(c => c.code === code);
      if (!current) return null;

      const children = customers
        .filter(c => c.parentCode === code)
        .map(child => buildStructure(child.code, level + 1))
        .filter(Boolean);

      return {
        customer: current,
        children,
        level
      };
    };

    return buildStructure(customerCode);
  };

  const getSlotOccupancy = () => {
    const occupancy: Record<number, { filled: number; capacity: number }> = {};
    
    // Define capacity for each level
    const levelCapacities: Record<number, number> = {
      1: 1,
      2: 5,
      3: 25,
      4: 125,
      5: 625,
      6: 3125
    };

    // Count customers at each level
    customers.forEach(customer => {
      const level = customer.mlmLevel || 1;
      if (!occupancy[level]) {
        occupancy[level] = {
          filled: 0,
          capacity: levelCapacities[level] || 1
        };
      }
      occupancy[level].filled++;
    });

    // Ensure all levels are represented
    Object.keys(levelCapacities).forEach(levelStr => {
      const level = parseInt(levelStr);
      if (!occupancy[level]) {
        occupancy[level] = {
          filled: 0,
          capacity: levelCapacities[level]
        };
      }
    });

    return occupancy;
  };

  const value: MLMContextType = {
    calculateMLMDistribution,
    createDummyCustomers,
    simulatePurchase,
    resetAdminPoints,
    getMLMStructure,
    getSlotOccupancy
  };

  return (
    <MLMContext.Provider value={value}>
      {children}
    </MLMContext.Provider>
  );
};

export const useMLM = () => {
  const context = useContext(MLMContext);
  if (!context) {
    throw new Error('useMLM must be used within a MLMProvider');
  }
  return context;
};

// Default export for compatibility with App.tsx
export default MLMProvider;
