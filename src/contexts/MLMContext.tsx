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

  // Calculate current global slot occupancy using waterfall model
  const getGlobalSlotOccupancy = () => {
    // Get total points from all customers (excluding admin)
    const totalPoints = customers
      .filter(c => c.code !== 'A100')
      .reduce((sum, customer) => sum + customer.points, 0);

    console.log(`Total points in system: ${totalPoints}`);

    const occupancy: Record<number, { filled: number; capacity: number }> = {};
    let remainingPoints = totalPoints;

    // Distribute points using waterfall model starting from level 2
    for (let level = 2; level <= 6; level++) {
      const capacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      const pointsAtThisLevel = Math.min(remainingPoints, capacity);
      
      occupancy[level] = {
        filled: pointsAtThisLevel,
        capacity
      };
      
      remainingPoints -= pointsAtThisLevel;
      
      if (remainingPoints <= 0) break;
    }

    // Admin level (level 1) is always occupied by A100
    occupancy[1] = {
      filled: 1,
      capacity: 1
    };

    console.log('Global slot occupancy:', occupancy);
    return occupancy;
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
      await updateCustomer(admin.id, {
        points: 0,
        miniCoins: 0,
        tier: 'Bronze'
      });
    }

    // Create test customers with different point amounts
    const testCustomers = [
      { name: 'Alice Johnson', phone: '9876543210', code: 'C001', points: 3, parentCode: 'A100' },
      { name: 'Bob Smith', phone: '9876543211', code: 'C002', points: 2, parentCode: 'A100' },
      { name: 'Carol Davis', phone: '9876543212', code: 'C003', points: 7, parentCode: 'A100' },
      { name: 'David Wilson', phone: '9876543213', code: 'C004', points: 15, parentCode: 'A100' },
      { name: 'Emma Brown', phone: '9876543214', code: 'C005', points: 8, parentCode: 'A100' },
    ];

    // Add all test customers
    for (const customerData of testCustomers) {
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
          mlmLevel: 2,
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

    console.log('Test customers created successfully!');
  };

  // Simulate a purchase
  const simulatePurchase = async (customerCode: string, purchaseAmount: number) => {
    console.log(`\n=== SIMULATING PURCHASE ===`);
    console.log(`Customer ${customerCode} making purchase of ₹${purchaseAmount}`);
    
    const pointsEarned = Math.floor(purchaseAmount / 5); // ₹1 for every ₹5 spent
    console.log(`This will earn ${pointsEarned} points`);
    
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

  // Get current slot occupancy - wrapper for global occupancy
  const getSlotOccupancy = () => {
    return getGlobalSlotOccupancy();
  };

  // Assign customer to appropriate MLM level based on their points and global occupancy
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

    // For other customers, assign based on where their points would be in the waterfall
    // This is for display purposes - their primary level is where their first points land
    let primaryLevel = 2; // Default to level 2
    
    // Get global occupancy to see current distribution
    const globalOccupancy = getGlobalSlotOccupancy();
    
    // Find the level where this customer's points would start filling
    let cumulativeCapacity = 0;
    for (let level = 2; level <= 6; level++) {
      const levelCapacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      if (totalPoints > 0) {
        primaryLevel = level;
        break;
      }
      cumulativeCapacity += levelCapacity;
    }

    // Update customer's MLM level if it changed
    if (customer.mlmLevel !== primaryLevel) {
      await updateCustomer(customer.id, {
        mlmLevel: primaryLevel,
        lastMLMDistribution: new Date().toISOString()
      });
      console.log(`Customer ${customerCode} assigned to level ${primaryLevel}`);
    }
  };

  // Helper function to distribute points using waterfall model
  const distributePointsWaterfall = (totalPoints: number) => {
    const distribution: Record<number, number> = {};
    let remainingPoints = totalPoints;
    
    // Fill levels sequentially starting from level 2
    for (let level = 2; level <= 6; level++) {
      if (remainingPoints <= 0) break;
      
      const levelCapacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      const pointsInThisLevel = Math.min(remainingPoints, levelCapacity);
      
      if (pointsInThisLevel > 0) {
        distribution[level] = pointsInThisLevel;
        remainingPoints -= pointsInThisLevel;
      }
    }
    
    return distribution;
  };

  // Calculate MLM distribution with cascading earnings
  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) {
      console.log(`Customer ${customerCode} not found`);
      return;
    }

    console.log(`\n=== MLM DISTRIBUTION START ===`);
    console.log(`Customer: ${customerCode}, Purchase: ₹${purchaseAmount}`);
    
    const pointsEarned = Math.floor(purchaseAmount / 5); // ₹1 for every ₹5 spent
    
    if (pointsEarned > 0) {
      // 1. Update the purchasing customer's points first
      const newCustomerPoints = customer.points + pointsEarned;
      const newCustomerMiniCoins = customer.miniCoins + pointsEarned;
      
      // Calculate new tier based on total points
      let newTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' = 'Bronze';
      if (newCustomerPoints >= 160) newTier = 'Diamond';
      else if (newCustomerPoints >= 80) newTier = 'Gold';
      else if (newCustomerPoints >= 40) newTier = 'Silver';
      else if (newCustomerPoints >= 12) newTier = 'Bronze';

      await updateCustomer(customer.id, {
        points: newCustomerPoints,
        miniCoins: newCustomerMiniCoins,
        tier: newTier,
        lastMLMDistribution: new Date().toISOString()
      });
      
      console.log(`${customerCode} earned ${pointsEarned} points (now has ${newCustomerPoints} total)`);

      // 2. Get current global distribution after adding the new points
      const currentOccupancy = getGlobalSlotOccupancy();
      
      // 3. Distribute the new points using waterfall model
      const newPointsDistribution = distributePointsWaterfall(pointsEarned);
      
      console.log('\n--- CASCADING EARNINGS DISTRIBUTION ---');
      console.log('New points distribution:', newPointsDistribution);

      // 4. Calculate admin earnings: ₹1 per point distributed to any level
      let totalAdminEarnings = 0;
      
      for (const [levelStr, newPointsInLevel] of Object.entries(newPointsDistribution)) {
        const level = parseInt(levelStr);
        
        if (newPointsInLevel > 0) {
          console.log(`\nLevel ${level} receives ${newPointsInLevel} new points`);
          
          // Admin gets ₹1 per point distributed (not per slot)
          totalAdminEarnings += newPointsInLevel;
          console.log(`Admin earns ${newPointsInLevel} points from Level ${level} (₹1 per point)`);
        }
      }

      console.log(`\nTotal admin earnings: ${totalAdminEarnings} points`);

      // Update admin with total earnings
      if (totalAdminEarnings > 0) {
        const admin = customers.find(c => c.code === 'A100');
        if (admin) {
          const newAdminPoints = admin.points + totalAdminEarnings;
          const newAdminMiniCoins = admin.miniCoins + totalAdminEarnings;
          
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

          console.log(`Admin A100 earned ${totalAdminEarnings} points (now has ${newAdminPoints} total)`);
        }
      }

      // 5. Distribute to lower level slot holders
      for (const [levelStr, newPointsInLevel] of Object.entries(newPointsDistribution)) {
        const level = parseInt(levelStr);
        
        if (newPointsInLevel > 0 && level > 2) {
          // Distribute to all lower levels (levels 2 to current level - 1)
          for (let lowerLevel = 2; lowerLevel < level; lowerLevel++) {
            const { filled: occupiedSlots } = currentOccupancy[lowerLevel] || { filled: 0 };
            
            if (occupiedSlots > 0) {
              // Each new point in higher level gives ₹1 per occupied slot in lower levels
              const totalEarningsForLevel = newPointsInLevel * occupiedSlots;
              
              // Get customers who have points contributing to this lower level
              const customersInThisLevel = customers.filter(c => {
                const contribution = getCustomerContributionToLevel(c.code, lowerLevel);
                return contribution > 0;
              });
              
              if (customersInThisLevel.length > 0) {
                for (const levelCustomer of customersInThisLevel) {
                  const customerSlots = getCustomerContributionToLevel(levelCustomer.code, lowerLevel);
                  const customerShare = (customerSlots / occupiedSlots);
                  const customerEarnings = Math.floor(totalEarningsForLevel * customerShare);
                  
                  if (customerEarnings > 0) {
                    const newLevelPoints = levelCustomer.points + customerEarnings;
                    const newLevelMiniCoins = levelCustomer.miniCoins + customerEarnings;
                    
                    // Calculate new tier
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

                    console.log(`Level ${lowerLevel}: ${levelCustomer.code} earned ${customerEarnings} points (${customerSlots}/${occupiedSlots} slots, ${(customerShare * 100).toFixed(1)}% share)`);
                  }
                }
              }
            }
          }
        }
      }

      console.log('=== MLM DISTRIBUTION COMPLETE ===\n');
    }
  };

  // Helper function to calculate how many slots a customer contributes to a specific level
  const getCustomerContributionToLevel = (customerCode: string, targetLevel: number): number => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer || customer.code === 'A100') return 0;
    
    let remainingPoints = customer.points;
    
    // Waterfall distribution: fill levels sequentially
    for (let level = 2; level <= 6; level++) {
      if (remainingPoints <= 0) break;
      
      const levelCapacity = mlmLevelCapacities[level as keyof typeof mlmLevelCapacities];
      const pointsInThisLevel = Math.min(remainingPoints, levelCapacity);
      
      if (level === targetLevel) {
        return pointsInThisLevel;
      }
      
      remainingPoints -= pointsInThisLevel;
    }
    
    return 0;
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
        earnings += Math.floor(order.amountPaid / 5);
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
