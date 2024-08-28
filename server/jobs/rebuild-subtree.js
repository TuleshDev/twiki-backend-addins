const _ = require('lodash')

/* global WIKI */

const rebuildSubtreeHelper = async () => {
  WIKI.logger.info(`Rebuilding page subtree...`)

  try {
    //WIKI.models = require('../core/db').init()
    //await WIKI.configSvc.loadFromDb()
    //await WIKI.configSvc.applyFlags()

    const pages = await WIKI.models.pages.query().select('id', 'path', 'localeCode', 'title', 'isPrivate', 'privateNS', 'level', 'parentSectionId').orderBy(['id'])
    let pagesClone = [...pages]
    let tree = []
    let pik = 0

    while (pagesClone.length > 0) {
      let page = pagesClone.pop()
      let previousPage = null
      let level = page.level
      let parentId = null
      let currentTree = []
      let currentTreeAncestors = []
      for (let i = 0; i < level + 1; i++) {
        const parentSectionId = page.parentSectionId
        const found = _.find(tree, {
          pageId: page.id
        })
        if (!found) {
          pik++
          let item = {
            id: pik,
            localeCode: page.localeCode,
            path: page.path,
            title: page.title,
            isPrivate: page.isPrivate,
            privateNS: page.privateNS,
            level: page.level,
            pageId: page.id,
            parentSectionId: parentSectionId
          }
          tree.push(item)
          currentTree.push(item)
          parentId = pik
          currentTreeAncestors.push({
            found: false,
            array: []
          })
        } else {
          parentId = found.id
          currentTreeAncestors.push({
            found: true,
            array: []
          })
        }
        if (previousPage) {
          previousPage.parent = parentId
        }
        for (let j = 0; j < i; j++) {
          currentTreeAncestors[j].array.push(parentId)
        }
        previousPage = page
        page = _.find(pages, {
          id: parentSectionId
        })
        _.remove(pagesClone, {
          id: parentSectionId
        })
      }
      for (let i = 0; i < level + 1; i++) {
        let item = currentTree[i]
        let ancestors = currentTreeAncestors[i]
        if (!ancestors.found) {
          item.ancestors = JSON.stringify(ancestors.array.reverse())
        }
      }
    }

    await WIKI.models.knex.table('pageSubtree').truncate()
    if (tree.length > 0) {
      // -> Save in chunks, because of per query max parameters (35k Postgres, 2k MSSQL, 1k for SQLite)
      if ((WIKI.config.db.type !== 'sqlite')) {
        for (const chunk of _.chunk(tree, 100)) {
          await WIKI.models.knex.table('pageSubtree').insert(chunk)
        }
      } else {
        for (const chunk of _.chunk(tree, 60)) {
          await WIKI.models.knex.table('pageSubtree').insert(chunk)
        }
      }
    }

    //await WIKI.models.knex.destroy()

    WIKI.logger.info(`Rebuilding page subtree: [ COMPLETED ]`)
  } catch (err) {
    WIKI.logger.error(`Rebuilding page subtree: [ FAILED ]`)
    WIKI.logger.error(err.message)
    // exit process with error code
    throw err
  }
}

module.exports = rebuildSubtreeHelper
