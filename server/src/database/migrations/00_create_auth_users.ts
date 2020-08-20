import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('auth_users', table => {
    table.increments('id').primary();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('password_reset_token');
    table.dateTime('password_reset_expires');

    table.timestamp('create_at')
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      .notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('auth_users');
}