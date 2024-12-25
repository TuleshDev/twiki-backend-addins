exports.up = knex => {
  return knex.schema
    .alterTable('pageTree', table => {
      table.integer('order').unsigned()
    })
    .alterTable('pageSubtree', table => {
      table.integer('order').unsigned().notNullable().defaultTo(0)
    })
    .alterTable('pages', table => {
      table.integer('order').unsigned().notNullable().defaultTo(0)
    }).then(() => {
      return knex('pages').update({
        order: knex.raw('id * 25')
      })
    })
}

exports.down = knex => { }
