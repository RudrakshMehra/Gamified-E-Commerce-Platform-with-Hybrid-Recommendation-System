-- Run this migration to add delivery_address support to orders
-- Migration: add delivery_address column to orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' ORDER BY ordinal_position;
