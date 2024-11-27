exports.up = knex => {
  return knex.schema
    .alterTable('pageTree', table => {
      table.boolean('visible').notNullable().defaultTo(false)
    })
}

exports.down = knex => { }
