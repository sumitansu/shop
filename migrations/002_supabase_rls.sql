-- Migration 002: Drop Obsolete Tables & Enforce Table Security on Neon PostgreSQL
-- Security Directive: Ensure default-deny on orders table and drop deprecated tables on Neon.

-- 1. Drop deprecated demo tables
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS vault_secrets CASCADE;

-- 2. Ensure orders table has Row Level Security enabled (fail-closed)
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- 3. Default-deny policy on orders for public role:
-- Direct or unauthenticated SQL queries cannot select or mutate orders.
-- Trusted backend service connections (table owner / database superuser) bypass RLS.
DROP POLICY IF EXISTS "orders_default_deny_public" ON orders;
CREATE POLICY "orders_default_deny_public" ON orders
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);
