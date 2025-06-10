
-- First, update any orders that reference A101 to reference A100 instead
UPDATE public.orders 
SET customer_id = (SELECT id FROM public.customers WHERE code = 'A100' LIMIT 1)
WHERE customer_id = (SELECT id FROM public.customers WHERE code = 'A101');

-- Update A100 to be the main admin with full MLM access
UPDATE public.customers 
SET 
  name = 'System Admin',
  tier = 'Diamond',
  points = 1000,
  mlm_level = 1,
  direct_referrals = '[]'::jsonb,
  total_downline_count = 0,
  monthly_commissions = '{}'::jsonb,
  total_commissions = 0
WHERE code = 'A100';

-- If A100 doesn't exist, create it
INSERT INTO public.customers (
  name, 
  phone, 
  code, 
  parent_code, 
  is_reserved, 
  is_pending,
  mlm_level,
  direct_referrals,
  total_downline_count,
  monthly_commissions,
  total_commissions,
  tier,
  points
) 
SELECT 
  'System Admin',
  'admin100',
  'A100',
  NULL,
  false,
  false,
  1,
  '[]'::jsonb,
  0,
  '{}'::jsonb,
  0,
  'Diamond',
  1000
WHERE NOT EXISTS (SELECT 1 FROM public.customers WHERE code = 'A100');

-- Now safely remove A101 after updating references
DELETE FROM public.customers WHERE code = 'A101';
