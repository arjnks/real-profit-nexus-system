
-- Create coin_transactions table
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'received', 'redeemed')),
  amount INTEGER NOT NULL,
  coin_value NUMERIC NOT NULL DEFAULT 5.00,
  source_order_id TEXT,
  source_user_code TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coin_wallets table
CREATE TABLE public.coin_wallets (
  user_code TEXT NOT NULL PRIMARY KEY,
  total_coins INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_coin_transactions_user_code ON coin_transactions(user_code);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);
CREATE INDEX idx_coin_transactions_source_order ON coin_transactions(source_order_id);
