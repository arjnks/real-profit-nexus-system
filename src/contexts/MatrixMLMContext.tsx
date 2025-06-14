
import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from '@/contexts/DataContext';
import { matrixMLMService } from '@/services/matrixMLMService';
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
    console.log(`Processing matrix purchase for ${customerCode}: ₹${purchaseAmount}`);

    try {
      const customer = customers.find(c => c.code === customerCode);
      if (!customer) {
        console.warn(`Customer ${customerCode} not found`);
        return;
      }

      // Calculate coins earned from purchase
      const coinCount = matrixMLMService.calculateCoinsFromPurchase(purchaseAmount, customer.mlmLevel);
      
      // Determine target level for coin placement
      const targetLevel = matrixMLMService.determineTargetLevel(customerCode, coinCount);

      console.log(`Customer ${customerCode} earned ${coinCount} coins, placing in level ${targetLevel}`);

      // Place coins in the matrix
      await matrixMLMService.placeCoinsInLevel(customerCode, targetLevel, coinCount);

      // Update customer's total coins
      await updateCustomer(customer.id, {
        totalCoins: (customer.totalCoins || 0) + coinCount,
        currentLevel: targetLevel
      });

      toast.success(`Matrix MLM: ${customerCode} placed ${coinCount} coins in level ${targetLevel}!`);

    } catch (error) {
      console.error('Error processing matrix purchase:', error);
      toast.error('Failed to process matrix MLM distribution');
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
      toast.success(`Matrix simulation completed for ${customerCode} with ₹${purchaseAmount}`);
    } catch (error) {
      console.error('Error in matrix simulation:', error);
      toast.error('Matrix simulation failed');
    }
  };

  const resetMatrixSystem = async () => {
    try {
      // Clear all slots
      const { error: slotsError } = await supabase
        .from('mlm_slots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (slotsError) throw slotsError;

      // Clear all distributions
      const { error: distributionsError } = await supabase
        .from('mlm_distributions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (distributionsError) throw distributionsError;

      // Reset customer matrix data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          matrix_earnings: 0,
          total_coins: 0,
          current_level: 1
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (customerError) throw customerError;

      toast.success('Matrix MLM system reset successfully!');
    } catch (error) {
      console.error('Error resetting matrix system:', error);
      toast.error('Failed to reset matrix system');
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
