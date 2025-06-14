
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

  // Calculate coins earned based on purchase amount
  calculateCoinsFromPurchase(purchaseAmount: number, customerLevel: number): number {
    // Logic based on your description:
    // A: 1 coin (₹5 value) -> Level 1
    // B: 2 coins (₹5 value each) -> Level 2
    // C: 3 coins (₹5 value each) -> Level 2
    // A (again): 10 coins (₹1 value each) -> Level 3
    // D: 15 coins (₹5 value each) -> Level 3
    // E: 125 coins (₹5 value each) -> Level 4
    // F: 625 coins (₹5 value each) -> Level 5
    // G: 3125 coins (₹5 value each) -> Level 6

    // Simplified calculation - you may need to adjust based on your specific business logic
    const baseCoins = Math.floor(purchaseAmount / 50); // Assuming ₹50 = 1 coin for simplicity
    return Math.max(1, baseCoins);
  },

  // Determine target level for coin placement
  determineTargetLevel(customerCode: string, coinCount: number): number {
    // Simplified logic - you may need to implement more complex rules
    if (coinCount <= 5) return 1;
    if (coinCount <= 25) return 2;
    if (coinCount <= 125) return 3;
    if (coinCount <= 625) return 4;
    if (coinCount <= 3125) return 5;
    return 6;
  }
};
