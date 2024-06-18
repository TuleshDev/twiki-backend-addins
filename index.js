const getPage = require('./server/models/pages')

module.exports = {
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
