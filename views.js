module.exports = {
  'all-facts': {
    map: (function (doc) {
      emit(doc.timestamp)
    }).toString()
  },
  'actor-facts': {
    map: (function (doc) {
      emit([doc.src, doc.timestamp])
      emit([doc.tgt, doc.timestamp])
    }).toString()
  },
  'actor-actions': {
    map: (function (doc) {
      emit([doc.src, doc.prd, '->', doc.timestamp], doc.tgt)
      emit([doc.tgt, doc.prd, '<-', doc.timestamp], doc.src)
    }).toString()
  },
  'actions': {
    map: (function (doc) {
       emit([doc.prd, doc.timestamp])
    }).toString()
  }
}
