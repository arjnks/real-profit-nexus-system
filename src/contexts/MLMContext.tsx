import React, { createContext, useContext } from 'react';
import { useData } from './DataContext';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId?: string) => Promise<void>;
  getMLMEarnings: (customerCode: string, level: number) => number;
  getMLMStructure: (customerCode: string) => any;
  validateMLMStructure: (customerCode: string) => boolean;
  assignCustomerToLevel: (customerCode: string, points: number) => Promise<void>;
  getSlotOccupancy: () => Record<number, { filled: number; capacity: number }>;
  createDummyCustomers: () => Promise<void>;
  simulatePurchase: (customerCode: string, amount: number) => Promise<void>;
  resetAdminPoints: () => Promise<void>;
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
  const { customers, updateCustomer, orders, addCustomer } = useData();

  // MLM Level capacities (total slots available)
  const mlmLevelCapacities = {
    1: 1,     // Admin level (A100) - 1 slot
    2: 5,     // 5 slots  
    3: 25,    // 25 slots
    4: 125,   // 125 slots
    5: 625,   // 625 slots
    6: 3125   // 3125 slots
  };

  // Reset admin points to 0
  const resetAdminPoints = async () => {
    const admin = customers.find(c => c.code === 'A100');
    if (admin) {
      await updateCustomer(admin.id, {
        points: 0,
        miniCoins: 0,
        tier: 'Bronze'
      });
      console.log('Admin A100 points reset to 0');
    }
  };

  // Create dummy customers for demonstration
  const createDummyCustomers = async () => {
    console.log('Creating dummy customers for MLM demonstration...');
    
    // Clear existing dummy customers first (keep only A100)
    const existingDummies = customers.filter(c => c.code.startsWith('C0') || c.code.startsWith('B0'));
    console.log('Clearing existing dummy customers:', existingDummies.length);

    // Ensure A100 admin exists with 0 points
    let admin = customers.find(c => c.code === 'A100');
    if (!admin) {
      admin = await addCustomer({
        name: 'System Admin',
        phone: 'admin100',
        code: 'A100',
        parentCode: null,
        isReserved: false,
        isPending: false,
        mlmLevel: 1,
        directReferrals: [],
        totalDownlineCount: 0,
        monthlyCommissions: {},
        totalCommissions: 0,
      });
    } else {
      // Reset admin to 0 points
      await updateCustomer(admin.id, {
        points: 0,
        miniCoins: 0,
        tier: 'Bronze'
      });
    }

    // Create Level 2 customers (under A100) - RESPECTING CAPACITY
    const level2Customers = [
      { name: 'Alice Johnson', phone: '9876543210', code: 'C001', points: 2, parentCode: 'A100' },
      { name: 'Bob Smith', phone: '9876543211', code: 'C002', points: 1, parentCode: 'A100' },
      { name: 'Carol Davis', phone: '9876543212', code: 'C003', points: 2, parentCode: 'A100' },
    ];

    // Create Level 3 customers (under level 2)
    const level3Customers = [
      { name: 'David Wilson', phone: '9876543213', code: 'C004', points: 3, parentCode: 'C001' },
      { name: 'Emma Brown', phone: '9876543214', code: 'C005', points: 2, parentCode: 'C001' },
      { name: 'Frank Miller', phone: '9876543215', code: 'C006', points: 4, parentCode: 'C002' },
      { name: 'Grace Lee', phone: '9876543216', code: 'C007', points: 3, parentCode: 'C003' },
    ];

    // Create Level 4 customers (under level 3)
    const level4Customers = [
      { name: 'Henry Taylor', phone: '9876543217', code: 'C008', points: 5, parentCode: 'C004' },
      { name: 'Ivy Chen', phone: '9876543218', code: 'C009', points: 4, parentCode: 'C005' },
      { name: 'Jack Brown', phone: '9876543219', code: 'C010', points: 3, parentCode: 'C006' },
    ];

    const allDummyCustomers = [...level2Customers, ...level3Customers, ...level4Customers];

    // Add all dummy customers
    for (const customerData of allDummyCustomers) {
      const existing = customers.find(c => c.code === customerData.code);
      if (!existing) {
        // Determine tier based on points
        let tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
        if (customerData.points >= 160) tier = 'Diamond';
        else if (customerData.points >= 80) tier = 'Gold';
        else if (customerData.points >= 40) tier = 'Silver';
        else if (customerData.points >= 12) tier = 'Bronze';

        const newCustomer = await addCustomer({
          name: customerData.name,
          phone: customerData.phone,
          code: customerData.code,
          parentCode: customerData.parentCode,
          isReserved: false,
          isPending: false,
          mlmLevel: 2, // Will be reassigned based on structure
          directReferrals: [],
          totalDownlineCount: 0,
          monthlyCommissions: {},
          totalCommissions: 0,
        });

        // Update with points after creation
        if (newCustomer) {
          await updateCustomer(newCustomer.id, {
            points: customerData.points,
            miniCoins: customerData.points,
            tier: tier
          });
          console.log(`Customer ${customerData.code} created with ${customerData.points} points, tier: ${tier}`);
        }
      }
    }

    console.log('Dummy customers created successfully!');
    
    // Assign customers to appropriate levels based on their points
    setTimeout(async () => {
      for (const customerData of allDummyCustomers) {
        await assignCustomerToLevel(customerData.code, customerData.points);
      }
      console.log('All customers assigned to appropriate MLM levels');
    }, 1000);
  };

  // Simulate a purchase that earns 30 points
  const simulatePurchase = async (customerCode: string, purchaseAmount: number) => {
    console.log(`\n=== SIMULATING PURCHASE ===`);
    console.log(`Customer ${customerCode} making purchase of ₹${purchaseAmount}`);
    console.log(`This will earn ${Math.floor(purchaseAmount / 5)} points (₹1 for every ₹5 spent)`);
    
    // Log admin's current state
    const adminBefore = customers.find(c => c.code === 'A100');
    console.log(`\nADMIN BEFORE: ${adminBefore?.points || 0} points, ${adminBefore?.miniCoins || 0} miniCoins`);
    
    // Trigger MLM distribution
    await calculateMLMDistribution(customerCode, purchaseAmount, `DEMO-${Date.now()}`);
    
    // Log admin's state after
    setTimeout(() => {
      const adminAfter = customers.find(c => c.code === 'A100');
      console.log(`\nADMIN AFTER: ${adminAfter?.points || 0} points, ${adminAfter?.miniCoins || 0} miniCoins`);
      console.log(`ADMIN EARNED: ${(adminAfter?.points || 0) - (adminBefore?.points || 0)} points from this transaction`);
      console.log(`=== SIMULATION COMPLETE ===\n`);
    }, 2000);
  };

  // Get current slot occupancy across all levels - FIXED TO RESPECT CAPACITY
  const getSlotOccupancy = () => {
    const occupancy: Record<number, { filled: number; capacity: number }> = {};
    
    for (let level = 1; level <= 6; level++) {
      const capacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      const customersAtLevel = customers.filter(c => c.mlmLevel === level);
      
      // Calculate filled slots but cap at level capacity
      const totalSlotsUsed = customersAtLevel.reduce((total, customer) => total + customer.points, 0);
      const filledSlots = Math.min(totalSlotsUsed, capacity);
      
      occupancy[level] = {
        filled: filledSlots,
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
        await updateCustomer(customer.id, {
          mlmLevel: 1,
          lastMLMDistribution: new Date().toISOString()
        });
      }
      return;
    }

    // Find appropriate level based on how many slots this customer's points will occupy
    const targetLevel = findAvailableLevel(totalPoints);

    // Update customer's MLM level if it changed
    if (customer.mlmLevel !== targetLevel) {
      await updateCustomer(customer.id, {
        mlmLevel: targetLevel,
        lastMLMDistribution: new Date().toISOString()
      });
      console.log(`Customer ${customerCode} assigned to level ${targetLevel} (will occupy ${totalPoints} slots)`);
    }
  };

  // Calculate MLM distribution - FIXED TO ENSURE ADMIN GETS POINTS
  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) {
      console.log(`Customer ${customerCode} not found`);
      return;
    }

    console.log(`Starting MLM distribution for ${customerCode} purchase of ₹${purchaseAmount}`);
    
    const distributionLog: string[] = [];
    const pointsEarned = Math.floor(purchaseAmount / 5); // ₹1 for every ₹5 spent
    
    if (pointsEarned > 0) {
      // Update the purchasing customer's points and reassign level if needed
      const newPoints = customer.points + pointsEarned;
      const newMiniCoins = customer.miniCoins + pointsEarned;
      
      // Calculate new tier based on total points
      let newTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
      if (newPoints >= 160) newTier = 'Diamond';
      else if (newPoints >= 80) newTier = 'Gold';
      else if (newPoints >= 40) newTier = 'Silver';
      else if (newPoints >= 12) newTier = 'Bronze';

      await updateCustomer(customer.id, {
        points: newPoints,
        miniCoins: newMiniCoins,
        tier: newTier,
        lastMLMDistribution: new Date().toISOString()
      });
      
      console.log(`Customer ${customerCode} earned ${pointsEarned} points (now has ${newPoints} total points)`);
      
      // Reassign customer to appropriate level based on their new total points
      await assignCustomerToLevel(customerCode, newPoints);

      distributionLog.push(
        `Customer ${customerCode} earned ${pointsEarned} points (now has ${newPoints} total points)`
      );

      // FIXED: Distribute earnings across levels with guaranteed admin share
      const occupancy = getSlotOccupancy();
      
      // Admin always gets 20% of points earned, regardless of their current points
      const admin = customers.find(c => c.code === 'A100');
      if (admin) {
        const adminEarnings = Math.floor(pointsEarned * 0.2); // 20% fixed share
        if (adminEarnings > 0) {
          const newAdminPoints = admin.points + adminEarnings;
          const newAdminMiniCoins = admin.miniCoins + adminEarnings;
          
          // Calculate admin's new tier
          let newAdminTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
          if (newAdminPoints >= 160) newAdminTier = 'Diamond';
          else if (newAdminPoints >= 80) newAdminTier = 'Gold';
          else if (newAdminPoints >= 40) newAdminTier = 'Silver';
          else if (newAdminPoints >= 12) newAdminTier = 'Bronze';

          await updateCustomer(admin.id, {
            points: newAdminPoints,
            miniCoins: newAdminMiniCoins,
            tier: newAdminTier,
            lastMLMDistribution: new Date().toISOString()
          });

          distributionLog.push(
            `Level 1 (Admin): A100 earned ${adminEarnings} points (20% fixed share)`
          );
          
          console.log(`Level 1 (Admin): A100 earned ${adminEarnings} points (20% fixed share)`);
        }
      }

      // Distribute remaining 80% proportionally among levels 2-6
      const remainingPoints = pointsEarned - Math.floor(pointsEarned * 0.2);
      
      for (let level = 2; level <= 6; level++) {
        const customersAtLevel = customers.filter(c => c.mlmLevel === level);
        const { filled: occupiedSlots, capacity } = occupancy[level];
        
        if (customersAtLevel.length > 0 && occupiedSlots > 0) {
          // Distribute proportionally among customers at this level based on their slot contribution
          const levelShare = Math.floor(remainingPoints * 0.16); // 80% ÷ 5 levels = 16% per level
          
          for (const levelCustomer of customersAtLevel) {
            const customerSlots = Math.min(levelCustomer.points, capacity); // Cap at level capacity
            const customerShare = customerSlots / Math.max(occupiedSlots, 1);
            const levelEarnings = Math.floor(levelShare * customerShare);
            
            if (levelEarnings > 0) {
              const newLevelPoints = levelCustomer.points + levelEarnings;
              const newLevelMiniCoins = levelCustomer.miniCoins + levelEarnings;
              
              // Calculate new tier based on points
              let newLevelTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
              if (newLevelPoints >= 160) newLevelTier = 'Diamond';
              else if (newLevelPoints >= 80) newLevelTier = 'Gold';
              else if (newLevelPoints >= 40) newLevelTier = 'Silver';
              else if (newLevelPoints >= 12) newLevelTier = 'Bronze';

              await updateCustomer(levelCustomer.id, {
                points: newLevelPoints,
                miniCoins: newLevelMiniCoins,
                tier: newLevelTier,
                lastMLMDistribution: new Date().toISOString()
              });

              distributionLog.push(
                `Level ${level}: ${levelCustomer.code} earned ${levelEarnings} points (${customerSlots} slots, ${(customerShare * 100).toFixed(1)}% share)`
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
        createDummyCustomers,
        simulatePurchase,
        resetAdminPoints,
      }}
    >
      {children}
    </MLMContext.Provider>
  );
};

export default MLMProvider;

}
