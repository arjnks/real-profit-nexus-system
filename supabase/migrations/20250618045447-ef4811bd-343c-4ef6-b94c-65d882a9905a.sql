
-- Create table for daily sales tracking
CREATE TABLE daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date DATE NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sale_date)
);

-- Create table for leaderboard configuration
CREATE TABLE leaderboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  top_count INTEGER NOT NULL DEFAULT 10,
  offer_title TEXT NOT NULL DEFAULT 'Top Performer Offer',
  offer_description TEXT NOT NULL DEFAULT 'Special discount for top performers',
  offer_discount_percentage INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leaderboard configuration
INSERT INTO leaderboard_config (top_count, offer_title, offer_description, offer_discount_percentage)
VALUES (10, 'Top 10 Performer Offer', 'Get 15% discount on your next purchase!', 15);

-- Create function to update daily sales when orders are confirmed
CREATE OR REPLACE FUNCTION update_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when order status changes to 'delivered' or 'confirmed'
  IF NEW.status IN ('delivered', 'confirmed') AND OLD.status != NEW.status THEN
    INSERT INTO daily_sales (sale_date, total_sales, total_points, total_orders)
    VALUES (
      CURRENT_DATE,
      NEW.total_amount,
      NEW.points,
      1
    )
    ON CONFLICT (sale_date)
    DO UPDATE SET
      total_sales = daily_sales.total_sales + NEW.total_amount,
      total_points = daily_sales.total_points + NEW.points,
      total_orders = daily_sales.total_orders + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily sales updates
CREATE TRIGGER trigger_update_daily_sales
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_sales();

-- Create view for customer leaderboard (based on total points)
CREATE OR REPLACE VIEW customer_leaderboard AS
SELECT 
  c.id,
  c.name,
  c.code,
  c.points,
  c.total_spent,
  c.tier,
  ROW_NUMBER() OVER (ORDER BY c.points DESC, c.total_spent DESC) as rank
FROM customers c
WHERE c.is_pending = FALSE
ORDER BY c.points DESC, c.total_spent DESC;

-- Enable RLS for new tables
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_config ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_sales (admin access only)
CREATE POLICY "Admin can view daily sales" ON daily_sales
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage daily sales" ON daily_sales
  FOR ALL USING (true);

-- Create policies for leaderboard_config (admin access only)
CREATE POLICY "Admin can view leaderboard config" ON leaderboard_config
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage leaderboard config" ON leaderboard_config
  FOR ALL USING (true);
