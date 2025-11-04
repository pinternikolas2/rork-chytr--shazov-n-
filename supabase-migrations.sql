-- Supabase Migration Script for Chytré Shazování
-- This script should be run in your Supabase SQL Editor
-- URL: https://vfgoizqsdljodwffcgyi.supabase.co

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(10) NOT NULL CHECK (role IN ('fighter', 'coach')),
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  height NUMERIC(5,2) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  discipline VARCHAR(20) NOT NULL CHECK (discipline IN ('mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing')),
  
  -- Fighter specific fields
  current_weight NUMERIC(5,2),
  target_weight NUMERIC(5,2),
  starting_weight NUMERIC(5,2),
  weight_class VARCHAR(50),
  target_fight_date TIMESTAMPTZ,
  cutting_start_date TIMESTAMPTZ,
  diet_type VARCHAR(20) CHECK (diet_type IN ('standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other')),
  training_intensity VARCHAR(20) CHECK (training_intensity IN ('low', 'moderate', 'high', 'professional')),
  has_previous_experience BOOLEAN DEFAULT false,
  trainer_name VARCHAR(255),
  profile_photo_uri TEXT,
  coach_id UUID REFERENCES profiles(id),
  
  -- Coach specific fields
  linked_fighters UUID[],
  is_premium BOOLEAN DEFAULT false,
  subscription_end_date TIMESTAMPTZ,
  certifications TEXT[],
  years_of_experience INTEGER,
  specializations VARCHAR(20)[] CHECK (
    specializations <@ ARRAY['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing']::VARCHAR[]
  ),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create fights table
CREATE TABLE IF NOT EXISTS fights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  weight_class VARCHAR(50) NOT NULL,
  target_weight_for_fight NUMERIC(5,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  weigh_in_time TIMESTAMPTZ,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  time VARCHAR(10) NOT NULL CHECK (time IN ('morning', 'evening')),
  body_fat_percentage NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create hydration_logs table
CREATE TABLE IF NOT EXISTS hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  amount INTEGER NOT NULL,
  sodium_mg INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL,
  protein NUMERIC(6,2) NOT NULL,
  carbs NUMERIC(6,2) NOT NULL,
  fat NUMERIC(6,2) NOT NULL,
  sodium_mg INTEGER NOT NULL,
  fiber NUMERIC(6,2),
  custom_food_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sleep_logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  hours NUMERIC(3,1) NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_notes table
CREATE TABLE IF NOT EXISTS daily_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  note TEXT NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  water_retention INTEGER CHECK (water_retention >= 1 AND water_retention <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_fights_user_id ON fights(user_id);
CREATE INDEX IF NOT EXISTS idx_fights_date ON fights(date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_id ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_date ON hydration_logs(date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date ON sleep_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_id ON daily_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON daily_notes(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fights_updated_at ON fights;
CREATE TRIGGER update_fights_updated_at
  BEFORE UPDATE ON fights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Fights: Users can CRUD their own fights
CREATE POLICY "Users can view their own fights" 
  ON fights FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own fights" 
  ON fights FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own fights" 
  ON fights FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own fights" 
  ON fights FOR DELETE 
  USING (user_id = auth.uid());

-- Weight logs: Users can CRUD their own logs
CREATE POLICY "Users can view their own weight logs" 
  ON weight_logs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own weight logs" 
  ON weight_logs FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own weight logs" 
  ON weight_logs FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own weight logs" 
  ON weight_logs FOR DELETE 
  USING (user_id = auth.uid());

-- Hydration logs: Users can CRUD their own logs
CREATE POLICY "Users can view their own hydration logs" 
  ON hydration_logs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own hydration logs" 
  ON hydration_logs FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own hydration logs" 
  ON hydration_logs FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own hydration logs" 
  ON hydration_logs FOR DELETE 
  USING (user_id = auth.uid());

-- Meal logs: Users can CRUD their own logs
CREATE POLICY "Users can view their own meal logs" 
  ON meal_logs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own meal logs" 
  ON meal_logs FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own meal logs" 
  ON meal_logs FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own meal logs" 
  ON meal_logs FOR DELETE 
  USING (user_id = auth.uid());

-- Sleep logs: Users can CRUD their own logs
CREATE POLICY "Users can view their own sleep logs" 
  ON sleep_logs FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sleep logs" 
  ON sleep_logs FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sleep logs" 
  ON sleep_logs FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sleep logs" 
  ON sleep_logs FOR DELETE 
  USING (user_id = auth.uid());

-- Daily notes: Users can CRUD their own logs
CREATE POLICY "Users can view their own daily notes" 
  ON daily_notes FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own daily notes" 
  ON daily_notes FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily notes" 
  ON daily_notes FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily notes" 
  ON daily_notes FOR DELETE 
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create triggers for updated_at on daily_notes
DROP TRIGGER IF EXISTS update_daily_notes_updated_at ON daily_notes;
CREATE TRIGGER update_daily_notes_updated_at
  BEFORE UPDATE ON daily_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles for fighters and coaches';
COMMENT ON TABLE fights IS 'Scheduled fights for fighters';
COMMENT ON TABLE weight_logs IS 'Daily weight tracking logs';
COMMENT ON TABLE hydration_logs IS 'Water intake tracking logs';
COMMENT ON TABLE meal_logs IS 'Meal and nutrition tracking logs';
COMMENT ON TABLE sleep_logs IS 'Sleep quality and duration tracking';
COMMENT ON TABLE daily_notes IS 'Daily notes and feelings tracking';
