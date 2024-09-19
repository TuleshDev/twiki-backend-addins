exports.up = knex => {
  return knex.schema
    .alterTable('pageTree', table => {
      table.integer('level').unsigned()
    })
}

exports.down = knex => { }
