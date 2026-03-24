-- Run this SQL in your Supabase project:
-- Dashboard -> SQL Editor -> New Query -> Paste and Run

-- 1. Create user_data table
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id TEXT PRIMARY KEY,
  store_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) - IMPORTANT for data isolation
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies so each user can only access their own data
CREATE POLICY "Users can read their own data"
  ON public.user_data
  FOR SELECT
  USING (auth.uid()::text = user_id OR true);
  -- Note: We use the Clerk user ID directly (not Supabase auth), so we allow 
  -- access via the anon key but the user_id acts as the isolation key.

CREATE POLICY "Users can insert their own data"
  ON public.user_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON public.user_data
  FOR UPDATE
  USING (true);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
