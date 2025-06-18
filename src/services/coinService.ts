
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
    
    // Record coin transaction
    const { error } = await supabase
      .from('coin_transactions')
      .insert({
        user_code: customerCode,
        transaction_type: 'earned',
        amount: coinsEarned,
        coin_value: coinValue,
        source_order_id: orderId,
        description: `Coins earned from purchase order ${orderId}`
      });

    if (error) {
      console.error('Error recording coin transaction:', error);
      throw error;
    }

    // Update user's coin wallet
    await this.updateCoinWallet(customerCode);
    
    return coinsEarned;
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
        // Record distribution transaction
        await supabase
          .from('coin_transactions')
          .insert({
            user_code: parent.code,
            transaction_type: 'received',
            amount: coinsToDistribute,
            coin_value: coinValue,
            source_order_id: orderId,
            source_user_code: customerCode,
            description: `MLM distribution from ${customerCode} (Level ${level})`
          });

        // Update parent's coin wallet
        await this.updateCoinWallet(parent.code);
      }

      currentCustomer = parent;
      level++;
    }
  },

  // Update coin wallet balance
  async updateCoinWallet(userCode: string): Promise<void> {
    const { data: transactions, error } = await supabase
      .from('coin_transactions')
      .select('amount, transaction_type')
      .eq('user_code', userCode);

    if (error) {
      console.error('Error fetching coin transactions:', error);
      return;
    }

    const totalCoins = transactions?.reduce((sum, tx) => {
      return tx.transaction_type === 'redeemed' 
        ? sum - tx.amount 
        : sum + tx.amount;
    }, 0) || 0;

    const totalValue = totalCoins * this.getCoinValue();

    // Upsert coin wallet
    await supabase
      .from('coin_wallets')
      .upsert({
        user_code: userCode,
        total_coins: totalCoins,
        total_value: totalValue,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_code' });
  },

  // Get user's coin wallet
  async getCoinWallet(userCode: string): Promise<CoinWallet | null> {
    const { data, error } = await supabase
      .from('coin_wallets')
      .select('*')
      .eq('user_code', userCode)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching coin wallet:', error);
      return null;
    }

    return data;
  },

  // Get coin transaction history
  async getCoinTransactions(userCode: string): Promise<CoinTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_code', userCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coin transactions:', error);
      return [];
    }

    return data || [];
  },

  // Redeem coins (convert to discount/cash)
  async redeemCoins(userCode: string, coinsToRedeem: number, orderId?: string): Promise<boolean> {
    const wallet = await this.getCoinWallet(userCode);
    if (!wallet || wallet.total_coins < coinsToRedeem) {
      throw new Error('Insufficient coins for redemption');
    }

    const coinValue = this.getCoinValue();
    
    // Record redemption transaction
    const { error } = await supabase
      .from('coin_transactions')
      .insert({
        user_code: userCode,
        transaction_type: 'redeemed',
        amount: coinsToRedeem,
        coin_value: coinValue,
        source_order_id: orderId,
        description: `Coins redeemed${orderId ? ` for order ${orderId}` : ''}`
      });

    if (error) {
      console.error('Error recording coin redemption:', error);
      throw error;
    }

    // Update wallet
    await this.updateCoinWallet(userCode);
    
    return true;
  }
};
