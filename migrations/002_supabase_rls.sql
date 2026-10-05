-- Migration 002: Row Level Security (RLS) & Vault Deprecation for Supabase & PostgreSQL
-- Security Directive Stage 4: Secrets must not live in app databases; enforce explicit default-deny policies.

-- =========================================================================
-- 1. Vault Deprecation
-- =========================================================================
-- Remove deprecated vault_secrets table from all databases. Secrets live in environment variables only.
DROP TABLE IF EXISTS vault_secrets;

-- =========================================================================
-- 2. Supabase Table: todos
-- =========================================================================
-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos FORCE ROW LEVEL SECURITY;

-- Policy 2a: Explicit Default-Deny for all public/anon traffic
-- In PostgreSQL RLS, default is deny-all, but an explicit deny policy ensures transparent auditability.
DROP POLICY IF EXISTS "Default deny all on todos" ON todos;
CREATE POLICY "Default deny all on todos" ON todos
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Policy 2b: Service Role Bypass for server-side trusted backend operations
DROP POLICY IF EXISTS "Service role bypass on todos" ON todos;
CREATE POLICY "Service role bypass on todos" ON todos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2c: Authenticated User Scoped Access (Optional - when client connects directly via Supabase Auth)
-- Users can only read their own todos if user_id is populated:
-- Note: Add user_id column if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'todos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE todos ADD COLUMN user_id TEXT;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can select own todos" ON todos;
CREATE POLICY "Users can select own todos" ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own todos" ON todos;
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- =========================================================================
-- 3. Neon / Supabase Table: posts
-- =========================================================================
-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;

-- Policy 3a: Explicit Default-Deny on mutations for public/anon
DROP POLICY IF EXISTS "Default deny mutations on posts" ON posts;
CREATE POLICY "Default deny mutations on posts" ON posts
  FOR INSERT
  TO public
  WITH CHECK (false);

DROP POLICY IF EXISTS "Default deny updates on posts" ON posts;
CREATE POLICY "Default deny updates on posts" ON posts
  FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Default deny deletes on posts" ON posts;
CREATE POLICY "Default deny deletes on posts" ON posts
  FOR DELETE
  TO public
  USING (false);

-- Policy 3b: Public read policy (posts are public articles, read-only to public)
DROP POLICY IF EXISTS "Public can read posts" ON posts;
CREATE POLICY "Public can read posts" ON posts
  FOR SELECT
  TO public
  USING (true);

-- Policy 3c: Service Role full bypass for server-side admin operations
DROP POLICY IF EXISTS "Service role bypass on posts" ON posts;
CREATE POLICY "Service role bypass on posts" ON posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
