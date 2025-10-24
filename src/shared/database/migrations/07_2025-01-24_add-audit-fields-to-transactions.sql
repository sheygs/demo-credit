-- SECURITY ENHANCEMENT: Add audit trail and idempotency fields to transactions table
--
-- Purpose:
--   1. user_id: Track WHO initiated each transaction (critical for disputes/fraud detection)
--   2. idempotency_key: Prevent duplicate charges if user retries failed requests
--   3. ip_address: Record originating IP for security audits
--   4. user_agent: Track device/browser for fraud detection
--   5. reference: External reference for payment gateway reconciliation
--
-- Migration: 07_2025-01-24_add-audit-fields-to-transactions.sql
-- Date: 2025-01-24
-- Author: sheygs

-- Add audit and security columns
ALTER TABLE transactions
  ADD COLUMN user_id INT NULL AFTER id,
  ADD COLUMN idempotency_key VARCHAR(255) NULL UNIQUE AFTER status,
  ADD COLUMN ip_address VARCHAR(45) NULL AFTER idempotency_key,
  ADD COLUMN user_agent TEXT NULL AFTER ip_address,
  ADD COLUMN reference VARCHAR(255) NULL AFTER user_agent,
  ADD COLUMN metadata JSON NULL AFTER reference;

-- Add foreign key constraint for user_id
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Add comments for documentation
ALTER TABLE transactions
  MODIFY COLUMN user_id INT NULL COMMENT 'User who initiated the transaction',
  MODIFY COLUMN idempotency_key VARCHAR(255) NULL COMMENT 'Unique key to prevent duplicate transactions',
  MODIFY COLUMN ip_address VARCHAR(45) NULL COMMENT 'IP address of request origin',
  MODIFY COLUMN user_agent TEXT NULL COMMENT 'User agent string for fraud detection',
  MODIFY COLUMN reference VARCHAR(255) NULL COMMENT 'External payment gateway reference',
  MODIFY COLUMN metadata JSON NULL COMMENT 'Additional transaction metadata';
