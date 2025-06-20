
-- Phase 1: Drop MLM-related database functions
DROP FUNCTION IF EXISTS public.distribute_commissions_from_level(integer, text, integer);
DROP FUNCTION IF EXISTS public.get_next_slot_position(integer);

-- Phase 1: Drop MLM-related tables
DROP TABLE IF EXISTS public.mlm_distributions;
DROP TABLE IF EXISTS public.mlm_level_config;
DROP TABLE IF EXISTS public.mlm_slots;
DROP TABLE IF EXISTS public.coin_transactions;
DROP TABLE IF EXISTS public.coin_wallets;

-- Phase 1: Remove MLM-related columns from customers table
ALTER TABLE public.customers 
DROP COLUMN IF EXISTS matrix_earnings,
DROP COLUMN IF EXISTS total_coins,
DROP COLUMN IF EXISTS current_level,
DROP COLUMN IF EXISTS mlm_level,
DROP COLUMN IF EXISTS direct_referrals,
DROP COLUMN IF EXISTS total_downline_count,
DROP COLUMN IF EXISTS monthly_commissions,
DROP COLUMN IF EXISTS total_commissions,
DROP COLUMN IF EXISTS last_mlm_distribution,
DROP COLUMN IF EXISTS mini_coins;

-- Phase 1: Remove MLM-related columns from orders table
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS mlm_distribution_log,
DROP COLUMN IF EXISTS used_points_discount;

-- Phase 2: Add missing column to orders table for proper field mapping
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address text;
