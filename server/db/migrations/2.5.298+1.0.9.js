exports.up = knex => {
  const dbCompat = {
    blobLength: (WIKI.config.db.type === `mysql` || WIKI.config.db.type === `mariadb`),
    charset: (WIKI.config.db.type === `mysql` || WIKI.config.db.type === `mariadb`),
    selfCascadeDelete: WIKI.config.db.type !== 'mssql'
  }
  return knex.schema
    .createTable('pageSubtree', table => {
      if (dbCompat.charset) { table.charset('utf8mb4') }
      table.integer('id').unsigned().primary()
      table.string('path').notNullable()
      table.string('title').notNullable()
      table.boolean('isPrivate').notNullable().defaultTo(false)
      table.string('privateNS')
      table.integer('level').unsigned().notNullable()
      table.integer('parentSectionId').unsigned().notNullable()
      table.json('ancestors')
    })
    .table('pageSubtree', table => {
      if (dbCompat.selfCascadeDelete) {
        table.integer('parent').unsigned().references('id').inTable('pageSubtree').onDelete('CASCADE')
      } else {
        table.integer('parent').unsigned()
      }
      table.integer('pageId').unsigned().references('id').inTable('pages').onDelete('CASCADE')
      table.string('localeCode', 5).references('code').inTable('locales')
    })
}

exports.down = knex => { }
