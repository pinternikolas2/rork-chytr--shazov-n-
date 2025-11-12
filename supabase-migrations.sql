-- Supabase Migration Script pro Chytré Shazování
-- Kompletní SQL migrace pro vytvoření databázové struktury
-- Spustit v Supabase SQL Editor na: https://vfgoizqsdljodwffcgyi.supabase.co

-- ============================================
-- 1. EXTENSIONS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. DROP EXISTING TABLES (pro čistý start)
-- ============================================

DROP TABLE IF EXISTS daily_notes CASCADE;
DROP TABLE IF EXISTS sleep_logs CASCADE;
DROP TABLE IF EXISTS meal_logs CASCADE;
DROP TABLE IF EXISTS hydration_logs CASCADE;
DROP TABLE IF EXISTS weight_logs CASCADE;
DROP TABLE IF EXISTS fights CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 3. CREATE TABLES
-- ============================================

-- Tabulka profiles (pouze pro zápasníky)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  role VARCHAR(10) NOT NULL DEFAULT 'fighter' CHECK (role = 'fighter'),
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  height NUMERIC(5,2) NOT NULL CHECK (height > 0),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  discipline VARCHAR(20) NOT NULL CHECK (discipline IN ('mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing')),
  
  -- Základní údaje o váze
  current_weight NUMERIC(5,2),
  target_weight NUMERIC(5,2),
  starting_weight NUMERIC(5,2),
  weight_class VARCHAR(50),
  
  -- Údaje o tréninku a zápasech
  target_fight_date TIMESTAMPTZ,
  cutting_start_date TIMESTAMPTZ,
  diet_type VARCHAR(20) CHECK (diet_type IN ('standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other')),
  training_intensity VARCHAR(20) CHECK (training_intensity IN ('low', 'moderate', 'high', 'professional')),
  trainings_per_week INTEGER CHECK (trainings_per_week >= 0 AND trainings_per_week <= 20),
  has_previous_experience BOOLEAN DEFAULT false,
  trainer_name VARCHAR(255),
  profile_photo_uri TEXT,
  
  -- Časová razítka
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_weights CHECK (
    current_weight IS NULL OR current_weight > 0
  )
);

-- Tabulka fights (plánované zápasy)
CREATE TABLE fights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  weight_class VARCHAR(50) NOT NULL,
  target_weight_for_fight NUMERIC(5,2) NOT NULL CHECK (target_weight_for_fight > 0),
  date TIMESTAMPTZ NOT NULL,
  weigh_in_time TIMESTAMPTZ,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_fight_date CHECK (date > created_at)
);

-- Tabulka weight_logs (měření váhy)
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  weight NUMERIC(5,2) NOT NULL CHECK (weight > 0),
  time VARCHAR(10) NOT NULL CHECK (time IN ('morning', 'evening')),
  body_fat_percentage NUMERIC(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_date_time UNIQUE (user_id, date, time)
);

-- Tabulka hydration_logs (pitný režim)
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  sodium_mg INTEGER CHECK (sodium_mg >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabulka meal_logs (jídla a výživa)
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein NUMERIC(6,2) NOT NULL CHECK (protein >= 0),
  carbs NUMERIC(6,2) NOT NULL CHECK (carbs >= 0),
  fat NUMERIC(6,2) NOT NULL CHECK (fat >= 0),
  sodium_mg INTEGER NOT NULL CHECK (sodium_mg >= 0),
  fiber NUMERIC(6,2) CHECK (fiber >= 0),
  custom_food_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabulka sleep_logs (spánek)
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  hours NUMERIC(3,1) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_sleep_date UNIQUE (user_id, date)
);

-- Tabulka daily_notes (denní poznámky)
CREATE TABLE daily_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  note TEXT NOT NULL,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  water_retention INTEGER CHECK (water_retention >= 1 AND water_retention <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_daily_note UNIQUE (user_id, date)
);

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_discipline ON profiles(discipline);
CREATE INDEX idx_profiles_target_fight_date ON profiles(target_fight_date);

-- Fights indexes
CREATE INDEX idx_fights_user_id ON fights(user_id);
CREATE INDEX idx_fights_date ON fights(date);
CREATE INDEX idx_fights_user_date ON fights(user_id, date);

-- Weight logs indexes
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(date);
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, date DESC);

-- Hydration logs indexes
CREATE INDEX idx_hydration_logs_user_id ON hydration_logs(user_id);
CREATE INDEX idx_hydration_logs_date ON hydration_logs(date);
CREATE INDEX idx_hydration_logs_user_date ON hydration_logs(user_id, date DESC);

-- Meal logs indexes
CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, date DESC);
CREATE INDEX idx_meal_logs_meal_type ON meal_logs(meal_type);

-- Sleep logs indexes
CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX idx_sleep_logs_date ON sleep_logs(date);
CREATE INDEX idx_sleep_logs_user_date ON sleep_logs(user_id, date DESC);

-- Daily notes indexes
CREATE INDEX idx_daily_notes_user_id ON daily_notes(user_id);
CREATE INDEX idx_daily_notes_date ON daily_notes(date);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, date DESC);

-- ============================================
-- 5. CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Funkce pro automatickou aktualizaci updated_at sloupce
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggery pro updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fights_updated_at
  BEFORE UPDATE ON fights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_notes_updated_at
  BEFORE UPDATE ON daily_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
-- Uživatelé mohou vidět, vytvářet a upravovat pouze svůj vlastní profil
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (id = auth.uid());

-- FIGHTS POLICIES
-- Uživatelé mohou spravovat pouze své vlastní zápasy
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

-- WEIGHT LOGS POLICIES
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

-- HYDRATION LOGS POLICIES
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

-- MEAL LOGS POLICIES
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

-- SLEEP LOGS POLICIES
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

-- DAILY NOTES POLICIES
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

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 9. TABLE COMMENTS (dokumentace)
-- ============================================

COMMENT ON TABLE profiles IS 'Profily uživatelů - pouze zápasníci';
COMMENT ON TABLE fights IS 'Plánované zápasy zápasníků';
COMMENT ON TABLE weight_logs IS 'Měření váhy (ranní/večerní)';
COMMENT ON TABLE hydration_logs IS 'Záznamy pitného režimu';
COMMENT ON TABLE meal_logs IS 'Záznamy jídel a výživy';
COMMENT ON TABLE sleep_logs IS 'Záznamy spánku a jeho kvality';
COMMENT ON TABLE daily_notes IS 'Denní poznámky, energie, zadržování vody';

-- Column comments
COMMENT ON COLUMN profiles.role IS 'Role uživatele - vždy "fighter"';
COMMENT ON COLUMN profiles.discipline IS 'Bojová disciplína: mma, boxing, wrestling, bjj, muayThai, kickboxing';
COMMENT ON COLUMN profiles.training_intensity IS 'Intenzita tréninků: low, moderate, high, professional';
COMMENT ON COLUMN profiles.diet_type IS 'Typ diety: standard, keto, paleo, vegetarian, vegan, other';
COMMENT ON COLUMN weight_logs.time IS 'Doba měření: morning nebo evening';
COMMENT ON COLUMN meal_logs.meal_type IS 'Typ jídla: breakfast, lunch, dinner, snack';
COMMENT ON COLUMN sleep_logs.quality IS 'Kvalita spánku: 1 (nejhorší) až 5 (nejlepší)';
COMMENT ON COLUMN daily_notes.energy_level IS 'Úroveň energie: 1 (nízká) až 5 (vysoká)';
COMMENT ON COLUMN daily_notes.water_retention IS 'Zadržování vody: 1 (žádné) až 5 (vysoké)';

-- ============================================
-- 10. USEFUL VIEWS (volitelné)
-- ============================================

-- View pro denní přehled (všechny logy za den)
CREATE OR REPLACE VIEW daily_overview AS
SELECT 
  p.id as user_id,
  p.full_name,
  date_trunc('day', wl.date) as log_date,
  wl.weight as morning_weight,
  wl2.weight as evening_weight,
  COALESCE(SUM(hl.amount), 0) as total_hydration,
  COALESCE(SUM(ml.calories), 0) as total_calories,
  COALESCE(SUM(ml.protein), 0) as total_protein,
  COALESCE(SUM(ml.carbs), 0) as total_carbs,
  COALESCE(SUM(ml.fat), 0) as total_fat,
  COALESCE(SUM(ml.sodium_mg), 0) as total_sodium,
  sl.hours as sleep_hours,
  sl.quality as sleep_quality,
  dn.energy_level,
  dn.water_retention,
  dn.note
FROM profiles p
LEFT JOIN weight_logs wl ON p.id = wl.user_id AND wl.time = 'morning'
LEFT JOIN weight_logs wl2 ON p.id = wl2.user_id AND wl2.time = 'evening' AND date_trunc('day', wl.date) = date_trunc('day', wl2.date)
LEFT JOIN hydration_logs hl ON p.id = hl.user_id AND date_trunc('day', wl.date) = date_trunc('day', hl.date)
LEFT JOIN meal_logs ml ON p.id = ml.user_id AND date_trunc('day', wl.date) = date_trunc('day', ml.date)
LEFT JOIN sleep_logs sl ON p.id = sl.user_id AND date_trunc('day', wl.date) = date_trunc('day', sl.date)
LEFT JOIN daily_notes dn ON p.id = dn.user_id AND date_trunc('day', wl.date) = date_trunc('day', dn.date)
GROUP BY p.id, p.full_name, log_date, wl.weight, wl2.weight, sl.hours, sl.quality, dn.energy_level, dn.water_retention, dn.note;

-- ============================================
-- KONEC MIGRACE
-- ============================================

-- Pro ověření vytvoření:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
