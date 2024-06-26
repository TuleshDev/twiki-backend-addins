const _ = require('lodash')
const fs = require('fs')
const getSiteGraphResolver = require('./server/graph/resolvers/site')
const getPageModel = require('./server/models/pages')

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
  updateGraphResolvers (resolversDict, graphHelper) {
    const additionalResolversDict = {
      site: getSiteGraphResolver(graphHelper)
    }

    const additionalKeys = _.keys(additionalResolversDict)
    additionalKeys.forEach(key => {
      delete resolversDict[key]
    })

    resolversDict = {
      ...resolversDict,
      ...additionalResolversDict
    }

    return resolversDict
  },
  updateModels (models, pagesBase, pageHelper) {
    const additionalModels = {
      pages: getPageModel(pagesBase, pageHelper)
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
