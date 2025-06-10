
import React, { createContext, useContext } from 'react';
import { useData } from './DataContext';

interface MLMContextType {
  calculateMLMDistribution: (customerCode: string, purchaseAmount: number, orderId?: string) => Promise<void>;
  getMLMEarnings: (customerCode: string, level: number) => number;
  getMLMStructure: (customerCode: string) => any;
  validateMLMStructure: (customerCode: string) => boolean;
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
  const { customers, updateCustomer, orders, setOrders } = useData();

  // Calculate MLM distribution based on your requirements
  const calculateMLMDistribution = async (customerCode: string, purchaseAmount: number, orderId?: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return;

    console.log(`Starting MLM distribution for ${customerCode} purchase of ₹${purchaseAmount}`);
    
    const distributionLog: string[] = [];
    
    // Traverse up the MLM tree for 6 levels
    let currentCode = customer.parentCode;
    let level = 1;
    
    while (currentCode && level <= 6) {
      const uplineMember = customers.find(c => c.code === currentCode);
      if (!uplineMember) break;

      // Each person earns ₹1 (1 point) for every ₹5 purchase from their downline
      const pointsEarned = Math.floor(purchaseAmount / 5);
      
      if (pointsEarned > 0) {
        // Award points to upline member
        const updatedMember = {
          ...uplineMember,
          points: uplineMember.points + pointsEarned,
          miniCoins: uplineMember.miniCoins + pointsEarned,
          lastMLMDistribution: new Date().toISOString()
        };

        // Calculate new tier based on points
        if (updatedMember.points >= 160) updatedMember.tier = 'Diamond';
        else if (updatedMember.points >= 80) updatedMember.tier = 'Gold';
        else if (updatedMember.points >= 40) updatedMember.tier = 'Silver';
        else if (updatedMember.points >= 12) updatedMember.tier = 'Bronze';

        await updateCustomer(uplineMember.id, updatedMember);

        distributionLog.push(
          `Level ${level}: ${uplineMember.code} (${uplineMember.name}) earned ${pointsEarned} points from ₹${purchaseAmount} purchase`
        );
        
        console.log(`Level ${level}: ${uplineMember.code} earned ${pointsEarned} points`);
      }

      currentCode = uplineMember.parentCode;
      level++;
    }

    // Update order with MLM distribution log if order ID provided
    if (orderId && distributionLog.length > 0) {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, mlmDistributionLog: [...(order.mlmDistributionLog || []), ...distributionLog] }
          : order
      ));
    }
  };

  // Get MLM earnings for a specific level
  const getMLMEarnings = (customerCode: string, level: number): number => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return 0;

    // Calculate earnings from specific level in downline
    let earnings = 0;
    const getDownlineAtLevel = (code: string, currentLevel: number): string[] => {
      if (currentLevel === level) return [code];
      if (currentLevel > level) return [];
      
      const directReferrals = customers.filter(c => c.parentCode === code);
      let result: string[] = [];
      
      directReferrals.forEach(referral => {
        result = result.concat(getDownlineAtLevel(referral.code, currentLevel + 1));
      });
      
      return result;
    };

    const downlineAtLevel = getDownlineAtLevel(customerCode, 1);
    
    // Calculate earnings from orders of downline members
    downlineAtLevel.forEach(downlineCode => {
      const memberOrders = orders.filter(o => o.customerCode === downlineCode && o.status === 'delivered');
      memberOrders.forEach(order => {
        earnings += Math.floor(order.amountPaid / 5); // ₹1 for every ₹5 purchase
      });
    });

    return earnings;
  };

  // Get complete MLM structure for a customer
  const getMLMStructure = (customerCode: string) => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return null;

    const buildStructure = (code: string, level: number = 1): any => {
      if (level > 6) return null; // Max 6 levels
      
      const member = customers.find(c => c.code === code);
      if (!member) return null;

      const directReferrals = customers.filter(c => c.parentCode === code);
      
      return {
        ...member,
        level,
        directCount: directReferrals.length,
        maxReferrals: 5,
        canAddMore: directReferrals.length < 5,
        children: directReferrals.map(ref => buildStructure(ref.code, level + 1)).filter(Boolean),
        totalEarnings: getMLMEarnings(code, level)
      };
    };

    return buildStructure(customerCode);
  };

  // Validate MLM structure constraints
  const validateMLMStructure = (customerCode: string): boolean => {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer) return false;

    // Check if customer can add more referrals (max 5 direct)
    const directReferrals = customers.filter(c => c.parentCode === customerCode);
    return directReferrals.length < 5;
  };

  return (
    <MLMContext.Provider
      value={{
        calculateMLMDistribution,
        getMLMEarnings,
        getMLMStructure,
        validateMLMStructure,
      }}
    >
      {children}
    </MLMContext.Provider>
  );
};

export default MLMProvider;
