Promise = require 'lie'
cuid = require 'cuid'

check = (x) -> throw {forbidden: 'something is missing.'} if not x

class Store
  constructor: (name='main') ->
    @pouch = new PouchDB(name)
    @pouch.put
      _id: '_design/troufles'
      views: require './views'

    @changes = @pouch.changes(
      since: 'now'
      live: true
      include_docs: false
      returnDocs: false
    )

  reset: ->
    @pouch.destroy()

  on: (type, listener) ->
    @changes.on(type, listener)

  save: (data) ->
    triple = {
      _id: (new Date).getTime() + '#' + cuid.slug()
      src: data.source
      prd: data.predicate
      tgt: data.target
    }

    check triple.prd
    check triple.src and triple.tgt

    @pouch.put(triple).catch (x) -> console.log x

  get: (id) ->
    @pouch.get(id)

  listTriples: ->
    @pouch.allDocs(
      descending: true
      include_docs: true
      limit: 100
    ).catch((x) -> console.log x).then (res) ->
      return (row.doc for row in res.rows)

module.exports = new Store()
