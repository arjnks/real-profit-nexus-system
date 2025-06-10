
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

      // Function to get members at each level
      const getMembersAtLevel = (parentCode: string, level: number): string[] => {
        if (level > 6) return [];
        
        const directMembers = customers.filter(c => c.parentCode === parentCode);
        let members = directMembers.map(m => m.code);
        totalNetworkSize += members.length;

        // Calculate earnings from this level
        members.forEach(memberCode => {
          const memberOrders = orders.filter(o => 
            o.customerCode === memberCode && 
            o.status === 'delivered'
          );
          
          const levelEarnings = memberOrders.reduce((sum, order) => 
            sum + Math.floor(order.amountPaid / 5), 0
          );
          
          if (!levelStats[level]) {
            levelStats[level] = { count: 0, earnings: 0 };
          }
          levelStats[level].count++;
          levelStats[level].earnings += levelEarnings;
          totalEarnings += levelEarnings;
        });

        // Recursively get next level
        directMembers.forEach(member => {
          getMembersAtLevel(member.code, level + 1);
        });

        return members;
      };

      getMembersAtLevel(customerCode, 1);

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
