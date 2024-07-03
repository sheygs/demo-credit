DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_wallet_id INT NULL,
  destination_wallet_id INT NULL,
  amount DECIMAL(10, 2),
  transaction_type ENUM('deposit', 'withdrawal', 'transfer'),
  status ENUM('success', 'failure'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (source_wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (destination_wallet_id) REFERENCES wallets(id)
);