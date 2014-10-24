module.exports = {
  'actor-facts': {
    map: (function (doc) {
      emit([doc.src, doc._id])
      emit([doc.tgt, doc._id])
    }).toString()
  },
  'actor-actions': {
    map: (function (doc) {
      emit([doc.src, doc.prd, '->', doc._id], doc.tgt)
      emit([doc.tgt, doc.prd, '<-', doc._id], doc.src)
    }).toString()
  },
  'actions': {
    map: (function (doc) {
       emit([doc.prd, doc._id])
    }).toString()
  }
}
