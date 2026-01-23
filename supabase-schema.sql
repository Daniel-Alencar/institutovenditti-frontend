-- ============================================================================
-- SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Execute this SQL in your Supabase SQL Editor to create all necessary tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active announcements query
CREATE INDEX idx_announcements_validity ON announcements(valid_from, valid_to);
CREATE INDEX idx_announcements_position ON announcements(position);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  legal_area TEXT NOT NULL,
  responses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- DIAGNOSTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  area JSONB NOT NULL,
  responses JSONB NOT NULL,
  user_data JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high')),
  ai_report TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at);
CREATE INDEX idx_diagnostics_urgency ON diagnostics(urgency_level);

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_whatsapp TEXT NOT NULL,
  referred_name TEXT NOT NULL,
  referred_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for referrer lookups
CREATE INDEX idx_referrals_referrer_email ON referrals(referrer_email);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);

-- ============================================================================
-- TERMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE CHECK (type IN ('terms_of_use', 'lgpd_terms')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default empty terms
INSERT INTO terms (type, content) VALUES 
  ('terms_of_use', ''),
  ('lgpd_terms', '')
ON CONFLICT (type) DO NOTHING;

-- ============================================================================
-- ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  access_count INTEGER DEFAULT 0,
  questionnaire_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for date queries
CREATE INDEX idx_analytics_date ON analytics(date DESC);

-- ============================================================================
-- ANALYTICS SUMMARY TABLE (for totals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_accesses INTEGER DEFAULT 0,
  total_questionnaires INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  area_distribution JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial summary record
INSERT INTO analytics_summary (total_accesses, total_questionnaires, total_users, area_distribution)
VALUES (0, 0, 0, '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_summary_updated_at BEFORE UPDATE ON analytics_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Allow public read access to announcements
CREATE POLICY "Allow public read access to announcements" ON announcements
  FOR SELECT USING (true);

-- Allow public insert/update/delete for announcements (you may want to restrict this later)
CREATE POLICY "Allow public insert announcements" ON announcements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update announcements" ON announcements
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete announcements" ON announcements
  FOR DELETE USING (true);

-- Allow public access to users
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update users" ON users
  FOR UPDATE USING (true);

-- Allow public access to diagnostics
CREATE POLICY "Allow public read access to diagnostics" ON diagnostics
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert diagnostics" ON diagnostics
  FOR INSERT WITH CHECK (true);

-- Allow public access to referrals
CREATE POLICY "Allow public read access to referrals" ON referrals
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

-- Allow public access to terms
CREATE POLICY "Allow public read access to terms" ON terms
  FOR SELECT USING (true);

CREATE POLICY "Allow public update terms" ON terms
  FOR UPDATE USING (true);

-- Allow public access to analytics
CREATE POLICY "Allow public read access to analytics" ON analytics
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert analytics" ON analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update analytics" ON analytics
  FOR UPDATE USING (true);

-- Allow public access to analytics_summary
CREATE POLICY "Allow public read access to analytics_summary" ON analytics_summary
  FOR SELECT USING (true);

CREATE POLICY "Allow public update analytics_summary" ON analytics_summary
  FOR UPDATE USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get or create today's analytics record
CREATE OR REPLACE FUNCTION get_or_create_analytics_for_date(target_date DATE)
RETURNS UUID AS $$
DECLARE
  analytics_id UUID;
BEGIN
  SELECT id INTO analytics_id FROM analytics WHERE date = target_date;
  
  IF analytics_id IS NULL THEN
    INSERT INTO analytics (date, access_count, questionnaire_count)
    VALUES (target_date, 0, 0)
    RETURNING id INTO analytics_id;
  END IF;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample announcements
INSERT INTO announcements (image_url, valid_from, valid_to, website_url, facebook_url, instagram_url, position)
VALUES 
  ('https://www.bontempo.com.br/blog/wp-content/uploads/2025/01/recepcao-moveis-planejados-bontempo-para-escritorio-de-advocacia-1-scaled.webp', 
   CURRENT_DATE, 
   CURRENT_DATE + INTERVAL '30 days', 
   'https://exemplo1.com.br', 
   'https://facebook.com/exemplo1', 
   'https://instagram.com/exemplo1', 
   1),
  ('https://www.bontempo.com.br/blog/wp-content/uploads/2025/01/recepcao-moveis-planejados-bontempo-para-escritorio-de-advocacia-1-scaled.webp', 
   CURRENT_DATE, 
   CURRENT_DATE + INTERVAL '30 days', 
   'https://exemplo2.com.br', 
   'https://facebook.com/exemplo2', 
   'https://instagram.com/exemplo2', 
   2),
  ('https://www.bontempo.com.br/blog/wp-content/uploads/2025/01/recepcao-moveis-planejados-bontempo-para-escritorio-de-advocacia-1-scaled.webp', 
   CURRENT_DATE, 
   CURRENT_DATE + INTERVAL '30 days', 
   'https://exemplo3.com.br', 
   'https://facebook.com/exemplo3', 
   'https://instagram.com/exemplo3', 
   3),
  ('https://www.bontempo.com.br/blog/wp-content/uploads/2025/01/recepcao-moveis-planejados-bontempo-para-escritorio-de-advocacia-1-scaled.webp', 
   CURRENT_DATE, 
   CURRENT_DATE + INTERVAL '30 days', 
   'https://exemplo4.com.br', 
   'https://facebook.com/exemplo4', 
   'https://instagram.com/exemplo4', 
   4)
ON CONFLICT DO NOTHING;
