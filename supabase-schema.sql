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


-- SCRIPT PARA CORREÇÃO DE PERMISSÕES NO SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Garantir acesso ao schema public para usuários anônimos
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. Garantir permissões em todas as tabelas
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Habilitar RLS e criar políticas de acesso para cada tabela
-- Isso garante que qualquer pessoa com a chave pública possa ler e escrever (ajuste conforme necessário para produção)

-- Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON announcements;
CREATE POLICY "Public Access" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON users;
CREATE POLICY "Public Access" ON users FOR ALL USING (true) WITH CHECK (true);

-- Diagnostics
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON diagnostics;
CREATE POLICY "Public Access" ON diagnostics FOR ALL USING (true) WITH CHECK (true);

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON referrals;
CREATE POLICY "Public Access" ON referrals FOR ALL USING (true) WITH CHECK (true);

-- Terms
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON terms;
CREATE POLICY "Public Access" ON terms FOR ALL USING (true) WITH CHECK (true);

-- Analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON analytics;
CREATE POLICY "Public Access" ON analytics FOR ALL USING (true) WITH CHECK (true);

-- Analytics Summary
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON analytics_summary;
CREATE POLICY "Public Access" ON analytics_summary FOR ALL USING (true) WITH CHECK (true);




-- ============================================================================
-- SUPABASE DATABASE SCHEMA UPDATES
-- ============================================================================
-- Execute este SQL no seu Supabase SQL Editor para atualizar as tabelas
-- com suporte a armazenamento de PDFs e novos campos de usuário
-- ============================================================================

-- ============================================================================
-- 1. ADICIONAR COLUNA pdf_url NA TABELA diagnostics
-- ============================================================================
-- Esta coluna armazenará a URL do PDF gerado e armazenado no Vercel Blob

ALTER TABLE diagnostics 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Criar índice para buscar diagnósticos por PDF URL
CREATE INDEX IF NOT EXISTS idx_diagnostics_pdf_url ON diagnostics(pdf_url);

-- ============================================================================
-- 2. ADICIONAR COLUNAS city E state NA TABELA users
-- ============================================================================
-- Estas colunas armazenarão a localização do usuário (cidade e estado)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS state TEXT;

-- Criar índice para buscar usuários por localização
CREATE INDEX IF NOT EXISTS idx_users_location ON users(city, state);

-- ============================================================================
-- 3. ADICIONAR COLUNA urgency_level NA TABELA users (OPCIONAL)
-- ============================================================================
-- Esta coluna pode ser usada para armazenar o nível de urgência mais recente
-- do usuário, para referência rápida na tabela de admin

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high'));

-- Criar índice para buscar usuários por nível de urgência
CREATE INDEX IF NOT EXISTS idx_users_urgency ON users(urgency_level);

-- ============================================================================
-- 4. ATUALIZAR COMENTÁRIOS DAS COLUNAS (DOCUMENTAÇÃO)
-- ============================================================================
-- Adicionar comentários para documentar as novas colunas

COMMENT ON COLUMN diagnostics.pdf_url IS 'URL do PDF armazenado no Vercel Blob';
COMMENT ON COLUMN users.city IS 'Cidade do usuário';
COMMENT ON COLUMN users.state IS 'Estado (UF) do usuário';
COMMENT ON COLUMN users.urgency_level IS 'Nível de urgência mais recente do usuário (low, medium, high)';

-- ============================================================================
-- 5. CRIAR VIEW PARA RELATÓRIO DE USUÁRIOS COM DIAGNÓSTICOS
-- ============================================================================
-- Esta view facilita a consulta de usuários com seus diagnósticos mais recentes

CREATE OR REPLACE VIEW users_with_diagnostics AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.whatsapp,
  u.legal_area,
  u.city,
  u.state,
  u.created_at,
  d.id as diagnostic_id,
  d.urgency_level,
  d.total_score,
  d.pdf_url,
  d.created_at as diagnostic_date
FROM users u
LEFT JOIN diagnostics d ON u.id = d.user_id
ORDER BY u.created_at DESC, d.created_at DESC;

-- ============================================================================
-- 6. CRIAR FUNÇÃO PARA ATUALIZAR urgency_level DO USUÁRIO
-- ============================================================================
-- Esta função atualiza automaticamente o nível de urgência do usuário
-- quando um novo diagnóstico é criado

CREATE OR REPLACE FUNCTION update_user_urgency_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET urgency_level = NEW.urgency_level
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar urgency_level
DROP TRIGGER IF EXISTS trigger_update_user_urgency ON diagnostics;
CREATE TRIGGER trigger_update_user_urgency
AFTER INSERT ON diagnostics
FOR EACH ROW
EXECUTE FUNCTION update_user_urgency_level();

-- ============================================================================
-- 7. ATUALIZAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================
-- Garantir que as novas colunas sejam acessíveis com as políticas existentes

-- A política existente "Allow public read access to users" já cobre as novas colunas
-- A política existente "Allow public read access to diagnostics" já cobre a nova coluna pdf_url

-- ============================================================================
-- 8. VERIFICAR DADOS EXISTENTES
-- ============================================================================
-- Consultas para verificar se as alterações foram aplicadas corretamente

-- Verificar estrutura da tabela users
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- Verificar estrutura da tabela diagnostics
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'diagnostics';

-- Verificar view criada
-- SELECT * FROM users_with_diagnostics LIMIT 10;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. As colunas adicionadas são NULLABLE por padrão
-- 2. Os índices melhoram a performance de consultas
-- 3. A view users_with_diagnostics facilita relatórios e queries
-- 4. O trigger atualiza automaticamente o urgency_level do usuário
-- 5. As políticas RLS existentes cobrem as novas colunas
-- 6. Todos os dados existentes serão preservados (as colunas novas terão NULL)

-- ============================================================================
-- ROLLBACK (Se necessário desfazer as alterações)
-- ============================================================================
-- Descomente as linhas abaixo para reverter as alterações

-- ALTER TABLE diagnostics DROP COLUMN IF EXISTS pdf_url;
-- ALTER TABLE users DROP COLUMN IF EXISTS city;
-- ALTER TABLE users DROP COLUMN IF EXISTS state;
-- ALTER TABLE users DROP COLUMN IF EXISTS urgency_level;
-- DROP VIEW IF EXISTS users_with_diagnostics;
-- DROP FUNCTION IF EXISTS update_user_urgency_level();




-- ============================================================================
-- SUPABASE STORAGE + PERMISSÕES FALTANTES
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================================

-- ============================================================================
-- 1. BUCKET DE ARMAZENAMENTO DE PDFs
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  true,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. POLÍTICAS DE ACESSO AO STORAGE (bucket "pdfs")
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read pdfs"   ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update pdfs" ON storage.objects;

CREATE POLICY "Allow public read pdfs"   ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Allow public insert pdfs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs');
CREATE POLICY "Allow public update pdfs" ON storage.objects FOR UPDATE USING (bucket_id = 'pdfs');

-- ============================================================================
-- 3. PERMISSÃO UPDATE NA TABELA diagnostics
-- ============================================================================
DROP POLICY IF EXISTS "Allow public update diagnostics" ON diagnostics;
CREATE POLICY "Allow public update diagnostics" ON diagnostics
  FOR UPDATE USING (true);

-- ============================================================================
-- 4. COLUNAS NECESSÁRIAS (seguro executar mesmo se já existirem)
-- ============================================================================
ALTER TABLE diagnostics ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS city          TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS state         TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS urgency_level TEXT
  CHECK (urgency_level IN ('low', 'medium', 'high'));

CREATE INDEX IF NOT EXISTS idx_diagnostics_pdf_url ON diagnostics(pdf_url);
CREATE INDEX IF NOT EXISTS idx_users_location      ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_users_urgency       ON users(urgency_level);

-- ============================================================================
-- 5. VIEW: usuários com diagnóstico mais recente
-- FIX: DROP obrigatório antes de recriar pois a estrutura de colunas mudou
-- ============================================================================
DROP VIEW IF EXISTS users_with_diagnostics;

CREATE VIEW users_with_diagnostics AS
SELECT
  u.id,
  u.full_name,
  u.email,
  u.whatsapp,
  u.legal_area,
  u.city,
  u.state,
  u.urgency_level,
  u.created_at,
  d.id           AS diagnostic_id,
  d.total_score,
  d.pdf_url,
  d.created_at   AS diagnostic_date
FROM users u
LEFT JOIN LATERAL (
  SELECT id, total_score, pdf_url, created_at
  FROM diagnostics
  WHERE user_id = u.id
  ORDER BY created_at DESC
  LIMIT 1
) d ON true
ORDER BY u.created_at DESC;

-- ============================================================================
-- 6. TRIGGER: sincroniza urgency_level do usuário ao criar diagnóstico
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_urgency_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET urgency_level = NEW.urgency_level
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_urgency ON diagnostics;
CREATE TRIGGER trigger_update_user_urgency
  AFTER INSERT ON diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_urgency_level();

-- ============================================================================
-- VERIFICAÇÃO (descomente para checar após executar)
-- ============================================================================
-- SELECT id, name, public FROM storage.buckets WHERE id = 'pdfs';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'diagnostics' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
-- SELECT * FROM users_with_diagnostics LIMIT 5;



-- ============================================================================
-- SUPABASE STORAGE + PERMISSÕES
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================================

-- ============================================================================
-- 1. BUCKETS DE ARMAZENAMENTO
-- ============================================================================

-- Bucket para PDFs das análises jurídicas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs', 'pdfs', true,
  10485760,                    -- 10 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de banner dos anúncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners', 'banners', true,
  5242880,                     -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. POLÍTICAS DE ACESSO AO STORAGE
-- ============================================================================

-- PDFs
DROP POLICY IF EXISTS "Allow public read pdfs"   ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update pdfs" ON storage.objects;

CREATE POLICY "Allow public read pdfs"   ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Allow public insert pdfs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs');
CREATE POLICY "Allow public update pdfs" ON storage.objects FOR UPDATE USING (bucket_id = 'pdfs');

-- Banners
DROP POLICY IF EXISTS "Allow public read banners"   ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete banners" ON storage.objects;

CREATE POLICY "Allow public read banners"   ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Allow public insert banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow public update banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
CREATE POLICY "Allow public delete banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

-- ============================================================================
-- 3. PERMISSÃO UPDATE NA TABELA diagnostics (para salvar pdf_url)
-- ============================================================================
DROP POLICY IF EXISTS "Allow public update diagnostics" ON diagnostics;
CREATE POLICY "Allow public update diagnostics" ON diagnostics
  FOR UPDATE USING (true);

-- ============================================================================
-- 4. COLUNAS NECESSÁRIAS (seguro executar mesmo se já existirem)
-- ============================================================================
ALTER TABLE diagnostics ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS city          TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS state         TEXT;
ALTER TABLE users       ADD COLUMN IF NOT EXISTS urgency_level TEXT
  CHECK (urgency_level IN ('low', 'medium', 'high'));

CREATE INDEX IF NOT EXISTS idx_diagnostics_pdf_url ON diagnostics(pdf_url);
CREATE INDEX IF NOT EXISTS idx_users_location      ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_users_urgency       ON users(urgency_level);

-- ============================================================================
-- 5. VIEW: usuários com diagnóstico mais recente
-- DROP obrigatório pois a estrutura de colunas mudou
-- ============================================================================
DROP VIEW IF EXISTS users_with_diagnostics;

CREATE VIEW users_with_diagnostics AS
SELECT
  u.id,
  u.full_name,
  u.email,
  u.whatsapp,
  u.legal_area,
  u.city,
  u.state,
  u.urgency_level,
  u.created_at,
  d.id           AS diagnostic_id,
  d.total_score,
  d.pdf_url,
  d.created_at   AS diagnostic_date
FROM users u
LEFT JOIN LATERAL (
  SELECT id, total_score, pdf_url, created_at
  FROM diagnostics
  WHERE user_id = u.id
  ORDER BY created_at DESC
  LIMIT 1
) d ON true
ORDER BY u.created_at DESC;

-- ============================================================================
-- 6. TRIGGER: sincroniza urgency_level do usuário ao criar diagnóstico
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_urgency_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET urgency_level = NEW.urgency_level
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_urgency ON diagnostics;
CREATE TRIGGER trigger_update_user_urgency
  AFTER INSERT ON diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_urgency_level();

-- ============================================================================
-- VERIFICAÇÃO (descomente para checar após executar)
-- ============================================================================
-- SELECT id, name, public FROM storage.buckets WHERE id IN ('pdfs', 'banners');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'diagnostics' ORDER BY ordinal_position;
-- SELECT * FROM users_with_diagnostics LIMIT 5;