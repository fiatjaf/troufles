tripleStore    = require './tripleStore.coffee'
dispatcher     = require './dispatcher.coffee'

{div, span, pre,
 small, i, p, a, button,
 h1, h2, h3, h4,
 form, legend, fieldset, input, textarea, select
 ul, li} = React.DOM

Main = React.createClass
  displayName: 'Main'
  reset: (e) ->
    e.preventDefault()
    tripleStore.reset().then(-> location.reload())

  render: ->
    (div {id: 'main'},
      (button
        onClick: @reset
      , 'RESET')
      (Add {})
      (List {})
    )

Add = React.createClass
  mixins: [React.addons.LinkedStateMixin]
  getInitialState: -> {}

  render: ->
    (form
      onSubmit: @createTriple
    ,
      (div {},
        (input
          valueLink: @linkState('source')
        )
        (input
          valueLink: @linkState('predicate')
        )
        (input
          valueLink: @linkState('target')
        )
      )
      (button {}, 'Save')
    )

  createTriple: (e) ->
    e.preventDefault()
    tripleStore.save(@state).then (res) =>
      @setState
        source: ''
        predicate: ''
        target: ''

List = React.createClass
  getInitialState: ->
    triples: []

  componentDidMount: ->
    @loadTriples()
    tripleStore.on 'change', @loadTriples

  loadTriples: ->
    tripleStore.listTriples().then (triples) =>
      @setState triples: triples

  render: ->
    (div {},
      (div
        className: 'triple'
      ,
        (div className: 'third',
          t.src
        )
        (div className: 'third',
          t.prd
        )
        (div className: 'third',
          t.tgt
        )
      ) for t in @state.triples
    )

React.renderComponent Main(), document.body













