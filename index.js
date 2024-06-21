const fs = require('fs')
const getPage = require('./server/models/pages')

module.exports = {
  getUpdatableGraphSchemas () {
    let additionalSchemas = fs.readdirSync(`${__dirname}/server/graph/schemas`)
    return additionalSchemas
  },
  updateGraphSchemas (typeDefs) {
    let additionalSchemas = this.getUpdatableGraphSchemas()
    additionalSchemas.forEach(schema => {
      typeDefs.push(fs.readFileSync(`${__dirname}/server/graph/schemas/${schema}`, 'utf8'))
    })

    return typeDefs
  },
  updateModels (models, pagesBase, pageHelper) {
    let additionalModels = {
      pages: getPage(pagesBase, pageHelper)
    }

    models = {
      ...models,
      ...additionalModels
    }

    return models
  },
  getPageViewPath () {
    return `${__dirname}/server/views/page`
  }
}
