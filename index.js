const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const getSetupHelper = require('./server/setup')
const getMasterHelper = require('./server/master')
const getSiteGraphResolver = require('./server/graph/resolvers/site')
const getPageModel = require('./server/models/pages')
const updateCommonDiskHelper = require('./server/modules/storage/disk/common')

module.exports = {
  getSetup (system) {
    return getSetupHelper(system)
  },
  getMaster (auth, localization, mail, system) {
    return getMasterHelper(auth, localization, mail, system)
  },
  getAppDataPath () {
    return `${__dirname}/server/app/data.yml`
  },
  getBaseMigrationPath (configDbType) {
    return path.join(`${__dirname}/server`, (configDbType !== 'sqlite') ? 'db/migrations' : 'db/migrations-sqlite')
  },
  getBaseMigrationPathBeta (configDbType) {
    return path.join(`${__dirname}/server`, (configDbType !== 'sqlite') ? 'db/beta/migrations' : 'db/beta/migrations-sqlite')
  },
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
  updateCommonDisk (commonDisk, pageHelper) {
    return updateCommonDiskHelper(commonDisk, pageHelper)
  },
  getPageViewPath () {
    return `${__dirname}/server/views/page`
  }
}
