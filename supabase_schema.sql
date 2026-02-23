-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Create Journals Table
CREATE TABLE journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  initial_balance DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Trades Table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  symbol TEXT NOT NULL,
  pnl DECIMAL NOT NULL,
  num_wins INTEGER DEFAULT 0,
  num_losses INTEGER DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- To add these columns to an EXISTING trades table, run:
-- ALTER TABLE trades ADD COLUMN num_wins INTEGER DEFAULT 0;
-- ALTER TABLE trades ADD COLUMN num_losses INTEGER DEFAULT 0;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Journals
CREATE POLICY "Users can manage their own journals" 
ON journals FOR ALL 
USING (auth.uid() = user_id);

-- 5. Create Policies for Trades
CREATE POLICY "Users can manage their own trades" 
ON trades FOR ALL 
USING (auth.uid() = user_id);
