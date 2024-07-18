exports.up = knex => {
  return knex.schema
    .alterTable('pages', table => {
      table.integer('level').unsigned().notNullable().defaultTo(0)
      table.integer('parentSectionId').unsigned().notNullable().defaultTo(0)
    })
}

exports.down = knex => { }
