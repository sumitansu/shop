-- Migration 001: Initial Schema for DoRaemon's Shop
-- Databases: Neon PostgreSQL / Vercel Postgres / Supabase PostgreSQL

-- 1. Relational Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- 2. Todos Table (Supabase / Postgres)
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos (created_at DESC);

