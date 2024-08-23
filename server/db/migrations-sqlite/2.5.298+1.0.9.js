exports.up = knex => {
  return knex.schema
    .createTable('pageSubtree', table => {
      table.integer('id').primary()
      table.string('path').notNullable()
      table.string('title').notNullable()
      table.boolean('isPrivate').notNullable().defaultTo(false)
      table.string('privateNS')
      table.integer('level').unsigned().notNullable()
      table.integer('parentSectionId').unsigned().notNullable()
      table.json('ancestors')

      table.integer('parent').unsigned().references('id').inTable('pageSubtree').onDelete('CASCADE')
      table.integer('pageId').unsigned().references('id').inTable('pages').onDelete('CASCADE')
      table.string('localeCode', 5).references('code').inTable('locales')
    })
}

exports.down = knex => { }
