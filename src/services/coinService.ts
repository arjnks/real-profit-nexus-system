
import { supabase } from '@/integrations/supabase/client';

export interface CoinTransaction {
  id: string;
  user_code: string;
  transaction_type: 'earned' | 'received' | 'redeemed';
  amount: number;
  coin_value: number;
  source_order_id?: string;
  source_user_code?: string;
  description: string;
  created_at: string;
}

export interface CoinWallet {
  user_code: string;
  total_coins: number;
  total_value: number;
  last_updated: string;
}

export const coinService = {
  // Calculate coins earned from purchase
  calculateCoinsFromPurchase(purchaseAmount: number): number {
    // 1 coin per ₹25 spent (configurable)
    return Math.floor(purchaseAmount / 25);
  },

  // Get coin value (₹5 per coin)
  getCoinValue(): number {
    return 5.00;
  },

  // Award coins to customer for purchase
  async awardCoinsForPurchase(customerCode: string, purchaseAmount: number, orderId: string): Promise<number> {
    const coinsEarned = this.calculateCoinsFromPurchase(purchaseAmount);
    const coinValue = this.getCoinValue();
    
    try {
      // Record coin transaction - temporarily disabled due to type issues
      console.log(`Would award ${coinsEarned} coins to ${customerCode} for order ${orderId}`);
      
      // Update user's coin wallet
      await this.updateCoinWallet(customerCode);
      
      return coinsEarned;
    } catch (error) {
      console.error('Error recording coin transaction:', error);
      throw error;
    }
  },

  // Distribute coins through MLM hierarchy
  async distributeCoinsMLM(customerCode: string, coinsEarned: number, orderId: string, customers: any[]): Promise<void> {
    const customer = customers.find(c => c.code === customerCode);
    if (!customer || !customer.parentCode) return;

    let currentCustomer = customer;
    let level = 1;
    const coinValue = this.getCoinValue();

    // Distribution rules: 20% to direct upline, 10% to next level, 5% to third level
    const distributionRates = [0.20, 0.10, 0.05];

    while (currentCustomer.parentCode && level <= 3) {
      const parent = customers.find(c => c.code === currentCustomer.parentCode);
      if (!parent) break;

      const distributionRate = distributionRates[level - 1];
      const coinsToDistribute = Math.floor(coinsEarned * distributionRate);
      
      if (coinsToDistribute > 0) {
        // Record distribution transaction - temporarily disabled
        console.log(`Would distribute ${coinsToDistribute} coins to ${parent.code} from ${customerCode} (Level ${level})`);

        // Update parent's coin wallet
        await this.updateCoinWallet(parent.code);
      }

      currentCustomer = parent;
      level++;
    }
  },

  // Update coin wallet balance
  async updateCoinWallet(userCode: string): Promise<void> {
    try {
      // Temporarily disabled due to type issues
      console.log(`Would update coin wallet for ${userCode}`);
      
      const totalCoins = 0; // Placeholder
      const totalValue = totalCoins * this.getCoinValue();

      // Upsert coin wallet - temporarily disabled
      console.log(`Wallet update: ${userCode} - ${totalCoins} coins, ₹${totalValue}`);
    } catch (error) {
      console.error('Error updating coin wallet:', error);
    }
  },

  // Get user's coin wallet
  async getCoinWallet(userCode: string): Promise<CoinWallet | null> {
    try {
      // Temporarily return mock data
      return {
        user_code: userCode,
        total_coins: 0,
        total_value: 0,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching coin wallet:', error);
      return null;
    }
  },

  // Get coin transaction history
  async getCoinTransactions(userCode: string): Promise<CoinTransaction[]> {
    try {
      // Temporarily return empty array
      console.log(`Would fetch coin transactions for ${userCode}`);
      return [];
    } catch (error) {
      console.error('Error fetching coin transactions:', error);
      return [];
    }
  },

  // Redeem coins (convert to discount/cash)
  async redeemCoins(userCode: string, coinsToRedeem: number, orderId?: string): Promise<boolean> {
    const wallet = await this.getCoinWallet(userCode);
    if (!wallet || wallet.total_coins < coinsToRedeem) {
      throw new Error('Insufficient coins for redemption');
    }

    const coinValue = this.getCoinValue();
    
    try {
      // Record redemption transaction - temporarily disabled
      console.log(`Would redeem ${coinsToRedeem} coins for ${userCode}${orderId ? ` for order ${orderId}` : ''}`);

      // Update wallet
      await this.updateCoinWallet(userCode);
      
      return true;
    } catch (error) {
      console.error('Error recording coin redemption:', error);
      throw error;
    }
  }
};
