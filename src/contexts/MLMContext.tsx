import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId: string) => Promise<void>;
  createDummyCustomers: () => Promise<void>;
  simulatePurchase: (customerCode: string, amount: number) => Promise<void>;
  resetAdminPoints: () => Promise<void>;
}

const MLMContext = createContext<MLMContextType | undefined>(undefined);

export const MLMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addCustomer, updateCustomer, customers, calculatePointsForProduct } = useData();

  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId: string) => {
    console.log(`Starting MLM distribution for customer ${customerCode} with purchase amount ${purchaseAmount}`);

    // Fetch the customer to get their parent code
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) {
      console.warn(`Customer ${customerCode} not found. MLM distribution aborted.`);
      return;
    }

    let currentCustomer = customer;
    let level = 1;
    let distributionLog = [`Order ${orderId}: MLM distribution started for ${customerCode} (₹${purchaseAmount})`];

    while (currentCustomer.parentCode && level <= 3) { // Limit to 3 levels for demonstration
      const parent = customers.find(c => c.code === currentCustomer.parentCode);

      if (!parent) {
        console.warn(`Parent ${currentCustomer.parentCode} not found. Stopping distribution at level ${level}.`);
        break;
      }

      // Calculate commission (simplified for demonstration)
      const commissionRate = 0.05 / level; // 5% commission for level 1, 2.5% for level 2, etc.
      const commission = purchaseAmount * commissionRate;

      // Award points to the parent
      const newPoints = parent.points + Math.floor(commission / 5); // Award 1 point for every ₹5 earned
      await updateCustomer(parent.id, { points: newPoints });

      distributionLog.push(`Level ${level}: ${parent.code} earned ₹${commission.toFixed(2)} (${Math.floor(commission / 5)} points)`);

      // Move to the next level
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
      // Create Alice (C001) - Direct under admin
      await addCustomer({
        name: 'Alice Johnson',
        phone: '9876543210',
        address: '123 Main Street, Mumbai',
        code: 'C001',
        parentCode: null,
        isReserved: false,
        isPending: false,
        mlmLevel: 2,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });

      // Create Bob (C002) - Direct under Alice
      await addCustomer({
        name: 'Bob Williams',
        phone: '8765432109',
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

      // Create Charlie (C003) - Direct under Bob
      await addCustomer({
        name: 'Charlie Brown',
        phone: '7654321098',
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

      // Create Diana (C004) - Direct under Alice
      await addCustomer({
        name: 'Diana Davis',
        phone: '6543210987',
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

      // Create Eve (C005) - Direct under Diana
      await addCustomer({
        name: 'Eve Wilson',
        phone: '5432109876',
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
    } catch (error) {
      console.error('Error creating dummy customers:', error);
      throw error;
    }
  };

  const simulatePurchase = async (customerCode: string, amount: number) => {
    console.log(`Simulating purchase of ${amount} by ${customerCode}`);
    
    try {
      const customer = customers.find(c => c.code === customerCode);
      if (!customer) {
        throw new Error(`Customer with code ${customerCode} not found`);
      }

      // Calculate points for the purchase
      const points = calculatePointsForProduct(amount);

      // Award points to the customer
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

  const value: MLMContextType = {
    calculateMLMDistribution,
    createDummyCustomers,
    simulatePurchase,
    resetAdminPoints
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
