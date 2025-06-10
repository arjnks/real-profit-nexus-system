
import React, { createContext, useContext } from 'react';
import { useData } from './DataContext';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId?: string) => Promise<void>;
  getMLMEarnings: (customerCode: string, level: number) => number;
  getMLMStructure: (customerCode: string) => any;
  validateMLMStructure: (customerCode: string) => boolean;
  assignCustomerToLevel: (customerCode: string, points: number) => Promise<void>;
  getSlotOccupancy: () => Record<number, { filled: number; capacity: number }>;
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

  // MLM Level capacities (total slots available)
  const mlmLevelCapacities = {
    1: 1,     // Admin level (A100) - 1 slot
    2: 5,     // 5 slots  
    3: 25,    // 25 slots
    4: 125,   // 125 slots
    5: 625,   // 625 slots
    6: 3125   // 3125 slots
  };

  // Get current slot occupancy across all levels
  const getSlotOccupancy = () => {
    const occupancy: Record<number, { filled: number; capacity: number }> = {};
    
    for (let level = 1; level <= 6; level++) {
      const capacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      // Calculate filled slots based on total points of customers at this level
      const customersAtLevel = customers.filter(c => c.mlmLevel === level);
      const filledSlots = customersAtLevel.reduce((total, customer) => total + customer.points, 0);
      
      occupancy[level] = {
        filled: Math.min(filledSlots, capacity), // Cap at capacity
        capacity
      };
    }
    
    return occupancy;
  };

  // Find the best level for a customer based on available slots
  const findAvailableLevel = (pointsToAllocate: number): number => {
    const occupancy = getSlotOccupancy();
    
    // Start from level 2 (level 1 is reserved for admin A100)
    for (let level = 2; level <= 6; level++) {
      const { filled, capacity } = occupancy[level];
      const availableSlots = capacity - filled;
      
      if (availableSlots >= pointsToAllocate) {
        return level;
      }
    }
    
    // If no level has enough slots, assign to highest level (6)
    return 6;
  };

  // Assign customer to appropriate MLM level based on points they will occupy
  const assignCustomerToLevel = async (customerCode: string, totalPoints: number) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return;

    // Admin A100 always stays at level 1
    if (customer.code === 'A100') {
      if (customer.mlmLevel !== 1) {
        const updatedCustomer = {
          ...customer,
          mlmLevel: 1,
          lastMLMDistribution: new Date().toISOString()
        };
        await updateCustomer(customer.id, updatedCustomer);
      }
      return;
    }

    // Find appropriate level based on how many slots this customer's points will occupy
    const targetLevel = findAvailableLevel(totalPoints);

    // Update customer's MLM level if it changed
    if (customer.mlmLevel !== targetLevel) {
      const updatedCustomer = {
        ...customer,
        mlmLevel: targetLevel,
        lastMLMDistribution: new Date().toISOString()
      };

      await updateCustomer(customer.id, updatedCustomer);
      console.log(`Customer ${customerCode} assigned to level ${targetLevel} (will occupy ${totalPoints} slots)`);
    }
  };

  // Calculate MLM distribution - points earned fill slots in the structure
  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return;

    console.log(`Starting MLM distribution for ${customerCode} purchase of ₹${purchaseAmount}`);
    
    const distributionLog: string[] = [];
    const pointsEarned = Math.floor(purchaseAmount / 5); // ₹1 for every ₹5 spent
    
    if (pointsEarned > 0) {
      // Update the purchasing customer's points and reassign level if needed
      const updatedCustomer = {
        ...customer,
        points: customer.points + pointsEarned,
        miniCoins: customer.miniCoins + pointsEarned,
        lastMLMDistribution: new Date().toISOString()
      };

      // Calculate new tier based on total points
      if (updatedCustomer.points >= 160) updatedCustomer.tier = 'Diamond';
      else if (updatedCustomer.points >= 80) updatedCustomer.tier = 'Gold';
      else if (updatedCustomer.points >= 40) updatedCustomer.tier = 'Silver';
      else if (updatedCustomer.points >= 12) updatedCustomer.tier = 'Bronze';

      await updateCustomer(customer.id, updatedCustomer);
      
      // Reassign customer to appropriate level based on their new total points
      await assignCustomerToLevel(customerCode, updatedCustomer.points);

      distributionLog.push(
        `Customer ${customerCode} earned ${pointsEarned} points (now has ${updatedCustomer.points} total points)`
      );

      // Distribute earnings across levels based on slot occupancy
      const occupancy = getSlotOccupancy();
      
      for (let level = 1; level <= 6; level++) {
        const customersAtLevel = customers.filter(c => c.mlmLevel === level);
        const { filled: occupiedSlots } = occupancy[level];
        
        if (customersAtLevel.length > 0 && occupiedSlots > 0) {
          // Distribute proportionally among customers at this level based on their slot contribution
          for (const levelCustomer of customersAtLevel) {
            const customerSlots = levelCustomer.points;
            const customerShare = customerSlots / Math.max(occupiedSlots, 1);
            const levelEarnings = Math.floor(pointsEarned * customerShare);
            
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
                `Level ${level}: ${levelCustomer.code} earned ${levelEarnings} points (${customerSlots} slots occupied, ${(customerShare * 100).toFixed(1)}% share)`
              );
              
              console.log(`Level ${level}: ${levelCustomer.code} earned ${levelEarnings} points from ${customerSlots} slots`);
            }
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

  // Get complete MLM structure with slot occupancy
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

    const occupancy = getSlotOccupancy();

    return {
      rootCustomer: customer,
      levels,
      occupancy,
      stats: {
        totalCustomers: customers.length,
        totalSlots: Object.values(occupancy).reduce((total, level) => total + level.filled, 0),
        maxCapacity: Object.values(mlmLevelCapacities).reduce((total, capacity) => total + capacity, 0),
        levelCounts: Object.keys(levels).reduce((acc, level) => {
          acc[level] = levels[Number(level)].length;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  };

  // Validate MLM structure - check if more slots can be added
  const validateMLMStructure = (customerCode: string): boolean => {
    const occupancy = getSlotOccupancy();
    
    // Check if any level has available slots
    for (let level = 2; level <= 6; level++) {
      const { filled, capacity } = occupancy[level];
      if (filled < capacity) {
        return true; // Structure can accommodate more slots
      }
    }
    
    return false; // All levels are full
  };

  return (
    <MLMContext.Provider
      value={{
        calculateMLMDistribution,
        getMLMEarnings,
        getMLMStructure,
        validateMLMStructure,
        assignCustomerToLevel,
        getSlotOccupancy,
      }}
    >
      {children}
    </MLMContext.Provider>
  );
};

export default MLMProvider;
