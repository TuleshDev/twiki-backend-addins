const getPage = require('./server/models/pages')

const updateModels = (models, pagesBase, pageHelper) => {
  let additionalModels = {
    pages: getPage(pagesBase, pageHelper)
  }

  models = {
    ...models,
    ...additionalModels
  }

  return models
}

module.exports = updateModels
