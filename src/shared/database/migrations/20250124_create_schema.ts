import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('user_name', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('password', 100).notNullable();
    table.string('phone_number', 100).notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });

  // Create wallets table
  await knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.string('currency', 10).defaultTo('NGN');
    table.decimal('balance', 15, 2).defaultTo(0);
    table.timestamps(true, true);

    // Foreign key
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Index
    table.index('user_id');
  });

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').nullable();
    table.integer('source_wallet_id').nullable();
    table.integer('destination_wallet_id').nullable();
    table.decimal('amount', 15, 2).notNullable();
    table
      .enum('transaction_type', ['deposit', 'withdrawal', 'transfer'])
      .notNullable();
    table
      .enum('status', ['success', 'failure', 'pending'])
      .defaultTo('pending');
    table.string('idempotency_key', 255).nullable().unique();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.string('reference', 255).nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table
      .foreign('source_wallet_id')
      .references('id')
      .inTable('wallets')
      .onDelete('SET NULL');
    table
      .foreign('destination_wallet_id')
      .references('id')
      .inTable('wallets')
      .onDelete('SET NULL');

    // Indexes
    table.index('user_id');
    table.index('source_wallet_id');
    table.index('destination_wallet_id');
    table.index('idempotency_key');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('wallets');
  await knex.schema.dropTableIfExists('users');
}
