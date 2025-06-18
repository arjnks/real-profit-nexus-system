import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from '@/contexts/DataContext';
import { matrixMLMService } from '@/services/matrixMLMService';
import { coinService } from '@/services/coinService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatrixMLMContextType {
  processCustomerPurchase: (customerCode: string, purchaseAmount: number, orderId: string) => Promise<void>;
  getLevelOccupancy: () => Promise<Record<number, { filled: number; capacity: number }>>;
  getCustomerDistributions: (customerCode: string) => Promise<any[]>;
  simulateMatrixPurchase: (customerCode: string, purchaseAmount: number) => Promise<void>;
  resetMatrixSystem: () => Promise<void>;
  getMatrixStructure: () => Promise<any>;
}

const MatrixMLMContext = createContext<MatrixMLMContextType | undefined>(undefined);

export const MatrixMLMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customers, updateCustomer } = useData();

  const processCustomerPurchase = async (customerCode: string, purchaseAmount: number, orderId: string) => {
    console.log(`Processing MLM purchase for ${customerCode}: ₹${purchaseAmount}`);

    try {
      const customer = customers.find(c => c.code === customerCode);
      if (!customer) {
        console.warn(`Customer ${customerCode} not found`);
        return;
      }

      // Step 1: Award coins to the purchasing customer
      const coinsEarned = await coinService.awardCoinsForPurchase(customerCode, purchaseAmount, orderId);
      console.log(`Customer ${customerCode} earned ${coinsEarned} coins`);

      // Step 2: Distribute coins through MLM hierarchy
      await coinService.distributeCoinsMLM(customerCode, coinsEarned, orderId, customers);
      
      // Step 3: Place coins in matrix levels (existing matrix logic)
      const targetLevel = matrixMLMService.determineTargetLevel(customerCode, coinsEarned);
      await matrixMLMService.placeCoinsInLevel(customerCode, targetLevel, coinsEarned);

      // Step 4: Update customer's matrix data
      await updateCustomer(customer.id, {
        totalCoins: (customer.totalCoins || 0) + coinsEarned,
        currentLevel: targetLevel,
        matrixEarnings: (customer.matrixEarnings || 0) + (coinsEarned * coinService.getCoinValue())
      });

      toast.success(`MLM Distribution Complete!`, {
        description: `${customerCode} earned ${coinsEarned} coins (₹${(coinsEarned * coinService.getCoinValue()).toFixed(2)}) and coins distributed to uplines`
      });

    } catch (error) {
      console.error('Error processing MLM purchase:', error);
      toast.error('Failed to process MLM distribution');
    }
  };

  const getLevelOccupancy = async () => {
    try {
      return await matrixMLMService.getLevelOccupancy();
    } catch (error) {
      console.error('Error getting level occupancy:', error);
      return {};
    }
  };

  const getCustomerDistributions = async (customerCode: string) => {
    try {
      return await matrixMLMService.getDistributionsForCustomer(customerCode);
    } catch (error) {
      console.error('Error getting customer distributions:', error);
      return [];
    }
  };

  const simulateMatrixPurchase = async (customerCode: string, purchaseAmount: number) => {
    try {
      await processCustomerPurchase(customerCode, purchaseAmount, `SIM-${Date.now()}`);
      toast.success(`MLM simulation completed for ${customerCode} with ₹${purchaseAmount}`);
    } catch (error) {
      console.error('Error in MLM simulation:', error);
      toast.error('MLM simulation failed');
    }
  };

  const resetMatrixSystem = async () => {
    try {
      // Clear all slots
      const { error: slotsError } = await supabase
        .from('mlm_slots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (slotsError) throw slotsError;

      // Clear all distributions
      const { error: distributionsError } = await supabase
        .from('mlm_distributions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (distributionsError) throw distributionsError;

      // Clear coin transactions
      const { error: coinError } = await supabase
        .from('coin_transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (coinError) throw coinError;

      // Clear coin wallets
      const { error: walletError } = await supabase
        .from('coin_wallets')
        .delete()
        .neq('user_code', 'non-existent');

      if (walletError) throw walletError;

      // Reset customer matrix data
      const updates = customers.map(customer => 
        updateCustomer(customer.id, {
          matrixEarnings: 0,
          totalCoins: 0,
          currentLevel: 1
        })
      );

      await Promise.all(updates);

      toast.success('Complete MLM system reset successfully!');
    } catch (error) {
      console.error('Error resetting MLM system:', error);
      toast.error('Failed to reset MLM system');
    }
  };

  const getMatrixStructure = async () => {
    try {
      const occupancy = await getLevelOccupancy();
      const configs = await matrixMLMService.getLevelConfigs();
      
      return {
        levels: configs.map(config => ({
          level: config.level,
          capacity: config.capacity,
          filled: occupancy[config.level]?.filled || 0,
          coinValue: config.coin_value
        })),
        totalSlots: configs.reduce((sum, config) => sum + config.capacity, 0),
        filledSlots: Object.values(occupancy).reduce((sum, occ) => sum + occ.filled, 0)
      };
    } catch (error) {
      console.error('Error getting matrix structure:', error);
      return null;
    }
  };

  const value: MatrixMLMContextType = {
    processCustomerPurchase,
    getLevelOccupancy,
    getCustomerDistributions,
    simulateMatrixPurchase,
    resetMatrixSystem,
    getMatrixStructure
  };

  return (
    <MatrixMLMContext.Provider value={value}>
      {children}
    </MatrixMLMContext.Provider>
  );
};

export const useMatrixMLM = () => {
  const context = useContext(MatrixMLMContext);
  if (!context) {
    throw new Error('useMatrixMLM must be used within a MatrixMLMProvider');
  }
  return context;
};

export default MatrixMLMProvider;
