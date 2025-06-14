
import { supabase } from '@/integrations/supabase/client';

export interface MLMSlot {
  id: string;
  customer_code: string;
  level: number;
  position: number;
  coin_value: number;
  created_at: string;
  updated_at: string;
}

export interface MLMLevelConfig {
  level: number;
  capacity: number;
  coin_value: number;
}

export interface MLMDistribution {
  id: string;
  from_level: number;
  to_level: number;
  from_customer_code: string;
  to_customer_code: string;
  amount: number;
  transaction_type: string;
  created_at: string;
}

export const matrixMLMService = {
  // Get level configurations
  async getLevelConfigs(): Promise<MLMLevelConfig[]> {
    const { data, error } = await supabase
      .from('mlm_level_config')
      .select('*')
      .order('level');

    if (error) {
      console.error('Error fetching level configs:', error);
      throw error;
    }

    return data || [];
  },

  // Get all slots for a specific level
  async getSlotsForLevel(level: number): Promise<MLMSlot[]> {
    const { data, error } = await supabase
      .from('mlm_slots')
      .select('*')
      .eq('level', level)
      .order('position');

    if (error) {
      console.error('Error fetching slots for level:', error);
      throw error;
    }

    return data || [];
  },

  // Get next available position for a level
  async getNextAvailablePosition(level: number): Promise<number | null> {
    const { data, error } = await supabase
      .rpc('get_next_slot_position', { target_level: level });

    if (error) {
      console.error('Error getting next position:', error);
      throw error;
    }

    return data;
  },

  // Place coins in a specific level
  async placeCoinsInLevel(customerCode: string, level: number, coinCount: number): Promise<void> {
    console.log(`Placing ${coinCount} coins for ${customerCode} in level ${level}`);

    for (let i = 0; i < coinCount; i++) {
      const position = await this.getNextAvailablePosition(level);
      
      if (position === null) {
        console.warn(`Level ${level} is full, cannot place more coins`);
        break;
      }

      const { error } = await supabase
        .from('mlm_slots')
        .insert({
          customer_code: customerCode,
          level: level,
          position: position,
          coin_value: level === 3 ? 1.00 : 5.00
        });

      if (error) {
        console.error('Error placing coin:', error);
        throw error;
      }
    }

    // Trigger commission distribution
    await this.distributeCommissions(level, customerCode, coinCount);
  },

  // Distribute commissions to lower levels
  async distributeCommissions(sourceLevel: number, sourceCustomerCode: string, coinCount: number): Promise<void> {
    console.log(`Distributing commissions from level ${sourceLevel} for ${coinCount} coins`);

    const { error } = await supabase
      .rpc('distribute_commissions_from_level', {
        source_level: sourceLevel,
        source_customer_code: sourceCustomerCode,
        coins_count: coinCount
      });

    if (error) {
      console.error('Error distributing commissions:', error);
      throw error;
    }
  },

  // Get MLM distributions for a customer
  async getDistributionsForCustomer(customerCode: string): Promise<MLMDistribution[]> {
    const { data, error } = await supabase
      .from('mlm_distributions')
      .select('*')
      .eq('to_customer_code', customerCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching distributions:', error);
      throw error;
    }

    return data || [];
  },

  // Get level occupancy statistics
  async getLevelOccupancy(): Promise<Record<number, { filled: number; capacity: number }>> {
    const configs = await this.getLevelConfigs();
    const occupancy: Record<number, { filled: number; capacity: number }> = {};

    for (const config of configs) {
      const slots = await this.getSlotsForLevel(config.level);
      occupancy[config.level] = {
        filled: slots.length,
        capacity: config.capacity
      };
    }

    return occupancy;
  },

  // Calculate coins earned based on purchase amount - improved logic
  calculateCoinsFromPurchase(purchaseAmount: number, customerLevel: number): number {
    // More realistic calculation: 1 coin per ₹25 spent
    const baseCoins = Math.floor(purchaseAmount / 25);
    return Math.max(1, baseCoins);
  },

  // Determine target level for coin placement - improved logic
  determineTargetLevel(customerCode: string, coinCount: number): number {
    // Start from level 1 and work up based on coin count
    if (coinCount <= 1) return 1;
    if (coinCount <= 5) return 2;
    if (coinCount <= 10) return 3;
    if (coinCount <= 25) return 4;
    if (coinCount <= 50) return 5;
    return 6;
  }
};
