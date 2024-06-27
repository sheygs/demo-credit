import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 1,
      user_name: 'sheygs',
      email: 'sheygs@gmail.com',
      password: '142851',
      phone_number: '+2348036767456',
    },
    {
      id: 2,
      user_name: 'mvck',
      email: 'mvck@gmail.com',
      password: '142852',
      phone_number: '+2348036767391',
    },
    {
      id: 3,
      user_name: 'kkols',
      email: 'kkolz@gmail.com',
      password: '142853',
      phone_number: '+2348036767564',
    },
  ]);
}
