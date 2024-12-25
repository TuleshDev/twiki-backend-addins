const _ = require('lodash')

/* global WIKI */

const rebuildSubtreeHelper = async () => {
  WIKI.logger.info(`Rebuilding page subtree...`)

  try {
    //WIKI.models = require('../core/db').init()
    //await WIKI.configSvc.loadFromDb()
    //await WIKI.configSvc.applyFlags()

    const pages = await WIKI.models.pages.query().select('id', 'path', 'localeCode', 'title', 'isPrivate', 'privateNS', 'level', 'parentSectionId', 'order').orderBy(['id'])
    let pagesClone = [...pages]
    let tree = []
    let pik = 0

    while (pagesClone.length > 0) {
      let page = pagesClone.pop()
      let level = page.level
      let parentId = null
      let currentTree = []
      for (let i = 0; i < level + 1; i++) {
        const parentSectionId = page.parentSectionId
        const found = _.find(tree, {
          pageId: page.id
        })
        let item = null
        if (!found) {
          pik++
          item = {
            id: pik,
            localeCode: page.localeCode,
            path: page.path,
            title: page.title,
            isPrivate: page.isPrivate,
            privateNS: page.privateNS,
            level: page.level,
            pageId: page.id,
            parentSectionId: parentSectionId,
            order: page.order
          }
          tree.push(item)
          currentTree.push({
            found: false,
            item: item,
            ancestors: []
          })
          parentId = pik
        } else {
          item = found
          currentTree.push({
            found: true,
            item: item,
            ancestors: []
          })
          parentId = item.id
        }
        for (let j = 0; j < i; j++) {
          currentTree[j].ancestors.push(parentId)
        }
        page = _.find(pages, {
          id: parentSectionId
        })
        _.remove(pagesClone, {
          id: parentSectionId
        })
      }
      let nextObject = null
      for (let i = 0; i < level + 1; i++) {
        let object = currentTree[i]
        if (!object.found) {
          object.item.ancestors = JSON.stringify(object.ancestors.reverse())
          if (i < level) {
            let nextObject = currentTree[i + 1]
            object.item.parent = nextObject.item.id
          }
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
