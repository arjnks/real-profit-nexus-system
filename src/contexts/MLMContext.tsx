
import React, { createContext, useContext } from 'react';
import { useData } from './DataContext';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId?: string) => Promise<void>;
  getMLMEarnings: (customerCode: string, level: number) => number;
  getMLMStructure: (customerCode: string) => any;
  validateMLMStructure: (customerCode: string) => boolean;
  assignCustomerToLevel: (customerCode: string, points: number) => Promise<void>;
}

const MLMContext = createContext<MLMContextType | undefined>(undefined);

export const useMLM = () => {
  const context = useContext(MLMContext);
  if (!context) {
    throw new Error('useMLM must be used within an MLMProvider');
  }
  return context;
};

export const MLMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customers, updateCustomer, orders } = useData();

  // MLM Level capacities
  const mlmLevelCapacities = {
    1: 1,     // Admin level (A100)
    2: 5,     // 5 slots  
    3: 25,    // 25 slots
    4: 125,   // 125 slots
    5: 625,   // 625 slots
    6: 3125   // 3125 slots
  };

  // Assign customer to appropriate MLM level based on points
  const assignCustomerToLevel = async (customerCode: string, points: number) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return;

    // Calculate which level this customer should be in
    let targetLevel = 6; // Start from highest level
    let totalSlots = 0;
    
    // Count filled slots from level 2 onwards (level 1 is admin)
    for (let level = 2; level <= 6; level++) {
      const customersAtLevel = customers.filter(c => c.mlmLevel === level).length;
      const capacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      
      if (customersAtLevel < capacity) {
        targetLevel = level;
        break;
      }
      totalSlots += capacity;
    }

    // Update customer's MLM level
    if (customer.mlmLevel !== targetLevel) {
      const updatedCustomer = {
        ...customer,
        mlmLevel: targetLevel,
        lastMLMDistribution: new Date().toISOString()
      };

      await updateCustomer(customer.id, updatedCustomer);
      console.log(`Customer ${customerCode} assigned to level ${targetLevel}`);
    }
  };

  // Calculate MLM distribution - each purchase triggers level-based earnings
  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return;

    console.log(`Starting MLM distribution for ${customerCode} purchase of ₹${purchaseAmount}`);
    
    const distributionLog: string[] = [];
    
    // First, assign the purchasing customer to appropriate level if they earn points
    const pointsEarned = Math.floor(purchaseAmount / 5);
    if (pointsEarned > 0) {
      await assignCustomerToLevel(customerCode, customer.points + pointsEarned);
    }

    // Distribute earnings across all 6 levels
    for (let level = 1; level <= 6; level++) {
      const customersAtLevel = customers.filter(c => c.mlmLevel === level);
      
      if (customersAtLevel.length > 0) {
        // Each customer at this level earns based on the purchase
        for (const levelCustomer of customersAtLevel) {
          const levelEarnings = Math.floor(purchaseAmount / 5); // ₹1 for every ₹5
          
          if (levelEarnings > 0) {
            const updatedMember = {
              ...levelCustomer,
              points: levelCustomer.points + levelEarnings,
              miniCoins: levelCustomer.miniCoins + levelEarnings,
              lastMLMDistribution: new Date().toISOString()
            };

            // Calculate new tier based on points
            if (updatedMember.points >= 160) updatedMember.tier = 'Diamond';
            else if (updatedMember.points >= 80) updatedMember.tier = 'Gold';
            else if (updatedMember.points >= 40) updatedMember.tier = 'Silver';
            else if (updatedMember.points >= 12) updatedMember.tier = 'Bronze';

            await updateCustomer(levelCustomer.id, updatedMember);

            distributionLog.push(
              `Level ${level}: ${levelCustomer.code} (${levelCustomer.name}) earned ${levelEarnings} points from ₹${purchaseAmount} purchase`
            );
            
            console.log(`Level ${level}: ${levelCustomer.code} earned ${levelEarnings} points`);
          }
        }
      }
    }

    console.log('MLM distribution completed:', distributionLog);
  };

  // Get MLM earnings for a specific level
  const getMLMEarnings = (customerCode: string, level: number): number => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return 0;

    // Calculate earnings from orders at this level
    let earnings = 0;
    const levelCustomers = customers.filter(c => c.mlmLevel === level);
    
    levelCustomers.forEach(levelCustomer => {
      const memberOrders = orders.filter(o => 
        o.customerCode === levelCustomer.code && 
        o.status === 'delivered'
      );
      
      memberOrders.forEach(order => {
        earnings += Math.floor(order.amountPaid / 5); // ₹1 for every ₹5 purchase
      });
    });

    return earnings;
  };

  // Get complete MLM structure
  const getMLMStructure = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return null;

    const levels: Record<number, any[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };

    // Group customers by their MLM level
    customers.forEach(c => {
      if (c.mlmLevel >= 1 && c.mlmLevel <= 6) {
        levels[c.mlmLevel].push(c);
      }
    });

    return {
      rootCustomer: customer,
      levels,
      stats: {
        totalCustomers: customers.length,
        levelCounts: Object.keys(levels).reduce((acc, level) => {
          acc[level] = levels[Number(level)].length;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  };

  // Validate MLM structure - returns if customer can add more points at current level
  const validateMLMStructure = (customerCode: string): boolean => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return false;

    const customersAtLevel = customers.filter(c => c.mlmLevel === customer.mlmLevel).length;
    const levelCapacity = mlmLevelCapacities[customer.mlmLevel as keyof typeof mlmLevelCapacities];
    
    // Customer can add more points if their level has capacity
    return customersAtLevel < levelCapacity;
  };

  return (
    <MLMContext.Provider
      value={{
        calculateMLMDistribution,
        getMLMEarnings,
        getMLMStructure,
        validateMLMStructure,
        assignCustomerToLevel,
      }}
    >
      {children}
    </MLMContext.Provider>
  );
};

export default MLMProvider;
