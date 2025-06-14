
-- Create a table to track MLM slots and positions
CREATE TABLE public.mlm_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 6),
  position INTEGER NOT NULL,
  coin_value NUMERIC NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(level, position)
);

-- Create index for faster queries
CREATE INDEX idx_mlm_slots_level_position ON public.mlm_slots(level, position);
CREATE INDEX idx_mlm_slots_customer_code ON public.mlm_slots(customer_code);

-- Create a table to track level capacities
CREATE TABLE public.mlm_level_config (
  level INTEGER PRIMARY KEY CHECK (level >= 1 AND level <= 6),
  capacity INTEGER NOT NULL,
  coin_value NUMERIC NOT NULL DEFAULT 5.00
);

-- Insert level configurations
INSERT INTO public.mlm_level_config (level, capacity, coin_value) VALUES
(1, 1, 5.00),
(2, 5, 5.00),
(3, 25, 1.00),
(4, 125, 5.00),
(5, 625, 5.00),
(6, 3125, 5.00);

-- Create a table to track commission distributions
CREATE TABLE public.mlm_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  from_customer_code TEXT NOT NULL,
  to_customer_code TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'commission',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to customers table for matrix system
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS matrix_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- Create function to get next available slot position for a level
CREATE OR REPLACE FUNCTION get_next_slot_position(target_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_pos INTEGER;
    level_capacity INTEGER;
BEGIN
    -- Get the capacity for this level
    SELECT capacity INTO level_capacity 
    FROM mlm_level_config 
    WHERE level = target_level;
    
    -- Find the next available position
    SELECT COALESCE(MIN(position), 1) INTO next_pos
    FROM generate_series(1, level_capacity) AS pos(position)
    WHERE NOT EXISTS (
        SELECT 1 FROM mlm_slots 
        WHERE level = target_level AND position = pos.position
    );
    
    -- Return NULL if level is full
    IF next_pos > level_capacity THEN
        RETURN NULL;
    END IF;
    
    RETURN next_pos;
END;
$$;

-- Create function to distribute commissions from a level
CREATE OR REPLACE FUNCTION distribute_commissions_from_level(
    source_level INTEGER,
    source_customer_code TEXT,
    coins_count INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    target_level INTEGER;
    target_customer RECORD;
    commission_per_coin NUMERIC := 1.00;
    total_commission NUMERIC;
BEGIN
    -- Distribute to all lower levels
    FOR target_level IN SELECT level FROM mlm_level_config WHERE level < source_level ORDER BY level DESC
    LOOP
        total_commission := coins_count * commission_per_coin;
        
        -- Get all customers at this target level
        FOR target_customer IN 
            SELECT DISTINCT customer_code 
            FROM mlm_slots 
            WHERE level = target_level
        LOOP
            -- Update customer's matrix earnings
            UPDATE customers 
            SET matrix_earnings = matrix_earnings + total_commission,
                points = points + FLOOR(total_commission / 5),
                updated_at = now()
            WHERE code = target_customer.customer_code;
            
            -- Record the distribution
            INSERT INTO mlm_distributions (
                from_level, to_level, from_customer_code, 
                to_customer_code, amount, transaction_type
            ) VALUES (
                source_level, target_level, source_customer_code,
                target_customer.customer_code, total_commission, 'matrix_commission'
            );
        END LOOP;
    END LOOP;
END;
$$;
