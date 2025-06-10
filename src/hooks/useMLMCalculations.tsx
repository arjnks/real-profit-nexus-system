
import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';

export const useMLMCalculations = (customerCode: string) => {
  const { customers, orders } = useData();
  const [mlmStats, setMLMStats] = useState({
    totalNetworkSize: 0,
    totalEarnings: 0,
    levelStats: {} as Record<number, { count: number; earnings: number }>
  });

  useEffect(() => {
    const calculateMLMStats = () => {
      const customer = customers.find(c => c.code === customerCode);
      if (!customer) return;

      // Calculate network size and earnings by level
      const levelStats: Record<number, { count: number; earnings: number }> = {};
      let totalNetworkSize = 0;
      let totalEarnings = 0;

      // Function to calculate stats for each level
      const calculateLevelStats = () => {
        // Loop through all 6 levels
        for (let level = 1; level <= 6; level++) {
          // Get customers at this level
          const customersAtLevel = customers.filter(c => c.mlmLevel === level);
          const levelCount = customersAtLevel.length;
          totalNetworkSize += levelCount;
          
          // Calculate earnings from this level
          let levelEarnings = 0;
          customersAtLevel.forEach(levelCustomer => {
            const customerOrders = orders.filter(o => 
              o.customerCode === levelCustomer.code && 
              o.status === 'delivered'
            );
            
            levelEarnings += customerOrders.reduce((sum, order) => 
              sum + Math.floor(order.amountPaid / 5), 0
            );
          });
          
          // Only add non-empty levels to stats
          if (levelCount > 0 || levelEarnings > 0) {
            levelStats[level] = { 
              count: levelCount, 
              earnings: levelEarnings 
            };
            totalEarnings += levelEarnings;
          }
        }
      };

      calculateLevelStats();

      setMLMStats({
        totalNetworkSize,
        totalEarnings,
        levelStats
      });
    };

    calculateMLMStats();
  }, [customers, orders, customerCode]);

  return mlmStats;
};
