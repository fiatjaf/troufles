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
  getInitialState: -> {}

  render: ->
    (div
      id: 'input'
    ,
      (div {},
        (Search
          className: 'third'
          search: @searchActor
          value: @state.source
          onChange: @change('source')
        )
        (Search
          className: 'third'
          search: @searchPredicate
          value: @state.predicate
          onChange: @change('predicate')
        )
        (Search
          className: 'third'
          search: @searchActor
          value: @state.target
          onChange: @change('target')
        )
      )
      (button
        onClick: @createTriple
      , 'Save')
    )

  change: (attr) -> (e) =>
    change = {}
    change[attr] = e.target.value
    @setState change

  createTriple: (e) ->
    e.preventDefault()
    tripleStore.save(@state).then (res) =>
      @setState
        source: ''
        predicate: ''
        target: ''

  searchActor: (term) ->
    tripleStore.searchActor(term)

  searchPredicate: (term, callback) ->
    tripleStore.searchPredicate(term)

Search = React.createClass
  getInitialState: ->
    options: []

  componentWillReceiveProps: ->
    @setState
      selectedOptionId: null
      options: []

  render: ->
    (div className: @props.className,
      (Autocomplete.Combobox
        onInput: @handleInput
        onSelect: @handleSelect
        value: @props.value
        (Autocomplete.Option
          key: option.id
          value: option.id
          label: option.label
        , option.display) for option in @state.options
      )
    )

  handleSelect: (value) ->
    @props.onChange {target: {value: value}}
    @setState selectedOptionId: value

  handleInput: (input) ->
    @props.onChange {target: {value: input}}
    @setState
      selectedOptionId: null
      options: []
    , =>
      @props.search(input).then (options) =>
        @setState options: options

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













