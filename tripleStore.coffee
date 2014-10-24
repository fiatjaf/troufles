Promise = require 'lie'
cuid = require 'cuid'

lunr = require 'lunr'
require('./lunr.stemmer.support.js')(lunr)
require('./lunr.pt.js')(lunr)
PouchDB.plugin require 'pouchdb-quick-search'

check = (x) -> throw {forbidden: 'something is missing.'} if not x
log = log

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

    @pouch.put
      _id: '_design/definitions'
      types: {}
      views: {}
    @pouch.get('_design/definitions').then((doc) => @definitions = doc)

  reset: ->
    @pouch.destroy()

  on: (type, listener) ->
    @changes.on(type, listener)

  updateDefinitions: ->
    @pouch.put(@definitions).then(=>
      @pouch.get('_design/definitions')
    ).then (doc) => @definitions = doc

  save: (data) ->
    triple = {
      _id: (new Date).getTime() + '#' + cuid.slug()
      src: data.source
      prd: data.predicate
      tgt: data.target
    }

    check triple.prd
    check triple.src or triple.tgt

    if not triple.src
      triple.src = '#' + cuid.slug()
    if not triple.tgt
      triple.tgt = '#' + cuid.slug()

    @pouch.put(triple).catch log

  get: (id) ->
    @pouch.get(id)

  listTriples: ->
    @pouch.allDocs(
      descending: true
      include_docs: true
      limit: 100
    ).catch(log).then (res) ->
      return (row.doc for row in res.rows)

  searchActor: (term) ->
    @pouch.search(
      query: term
      fields: ['src', 'tgt']
      include_docs: true
      language: 'pt'
      mm: '50%'
      highlighting: true
      highlighting_pre: ''
      highlighting_post: ''
    ).catch(log).then (res) ->
      results = []
      for row in res.rows
        if 'tgt' == Object.keys(row.highlighting)[0] and
           row.doc.src[0] == '#' and
           row.doc.src.length > 6 and row.doc.src.length < 12
          results.push {
            label: row.doc.tgt
            display: row.doc.prd + ' -> ' + row.doc.tgt
            id: row.doc.src
          }
        if 'src' == Object.keys(row.highlighting)[0] and
           row.doc.tgt[0] == '#' and
           row.doc.tgt.length > 6 and row.doc.tgt.length < 12
          results.push {
            label: row.doc.src
            display: row.doc.src + ' <- ' + row.doc.prd
            id: row.doc.tgt
          }
      return results

  searchPredicate: (term) ->
    @pouch.search(
      query: term
      fields: ['prd']
      language: 'pt'
      mm: '50%'
      highlighting: true
      highlighting_pre: ''
      highlighting_post: ''
    ).catch(log).then (res) ->
      ({
        display: row.highlighting.prd
        label: row.highlighting.prd
        id: row.highlighting.prd
       } for row in res.rows)


module.exports = new Store()
