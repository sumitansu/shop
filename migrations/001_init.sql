-- Migration 001: Orders Table Schema for DoRaemon's Shop
-- Database: Neon Serverless PostgreSQL

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  config JSONB NOT NULL,
  price_snapshot_inr INTEGER NOT NULL,
  promo_used VARCHAR(50) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for order retrieval and status filtering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

