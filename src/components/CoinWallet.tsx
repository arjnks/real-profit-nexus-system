
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, History, Gift, TrendingUp } from 'lucide-react';
import { coinService, CoinWallet as CoinWalletType, CoinTransaction } from '@/services/coinService';
import { toast } from 'sonner';

interface CoinWalletProps {
  customerCode: string;
  showTransactions?: boolean;
}

const CoinWallet: React.FC<CoinWalletProps> = ({ customerCode, showTransactions = false }) => {
  const [wallet, setWallet] = useState<CoinWalletType | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [customerCode]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [walletData, transactionData] = await Promise.all([
        coinService.getCoinWallet(customerCode),
        showTransactions ? coinService.getCoinTransactions(customerCode) : Promise.resolve([])
      ]);
      
      setWallet(walletData);
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load coin wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <Gift className="h-4 w-4 text-green-600" />;
      case 'received': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'redeemed': return <Coins className="h-4 w-4 text-orange-600" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600';
      case 'received': return 'text-blue-600';
      case 'redeemed': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Coin Wallet Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            Coin Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-800">
                {wallet?.total_coins || 0}
              </div>
              <div className="text-sm text-yellow-600">Total Coins</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-800">
                ₹{wallet?.total_value?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-green-600">Total Value</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            1 Coin = ₹{coinService.getCoinValue().toFixed(2)} • Last updated: {wallet?.last_updated ? new Date(wallet.last_updated).toLocaleString() : 'Never'}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type === 'redeemed' ? '-' : '+'}
                        {transaction.amount} coins
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{(transaction.amount * transaction.coin_value).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No coin transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoinWallet;
