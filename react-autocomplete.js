!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.Autocomplete=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
module.exports = addClass;
function addClass(existing, added) {
  if (!existing)
    return added;
  if (existing.indexOf(added) > -1)
    return existing;
  return existing + ' ' + added;
}

//# sourceMappingURL=<compileOutput>


},{}],2:[function(require,module,exports){
"use strict";
var guid = 0;
var k = function() {};
var addClass = require('./add-class');
var ComboboxOption = require('./option');
module.exports = React.createClass({
  displayName: 'exports',
  propTypes: {
    autocomplete: React.PropTypes.oneOf(['both', 'inline', 'list']),
    onInput: React.PropTypes.func,
    onSelect: React.PropTypes.func,
    value: React.PropTypes.any
  },
  getDefaultProps: function() {
    return {
      autocomplete: 'both',
      onInput: k,
      onSelect: k,
      value: null
    };
  },
  getInitialState: function() {
    return {
      value: this.props.value,
      inputValue: this.findInputValue(),
      isOpen: false,
      focusedIndex: null,
      matchedAutocompleteOption: null,
      usingKeyboard: false,
      activedescendant: null,
      listId: 'rf-combobox-list-' + (++guid),
      menu: {
        children: [],
        activedescendant: null,
        isEmpty: true
      }
    };
  },
  componentWillMount: function() {
    this.setState({menu: this.makeMenu()});
  },
  componentWillReceiveProps: function(newProps) {
    this.setState({menu: this.makeMenu(newProps.children)});
  },
  makeMenu: function(children) {
    var activedescendant;
    var isEmpty = true;
    children = children || this.props.children;
    React.Children.forEach(children, function(child, index) {
      if (child.type !== ComboboxOption.type)
        return;
      isEmpty = false;
      var props = child.props;
      if (this.state.value === props.value) {
        props.id = props.id || 'rf-combobox-selected-' + (++guid);
        props.isSelected = true;
        activedescendant = props.id;
      }
      props.onBlur = this.handleOptionBlur;
      props.onClick = this.selectOption.bind(this, child);
      props.onFocus = this.handleOptionFocus;
      props.onKeyDown = this.handleOptionKeyDown.bind(this, child);
      props.onMouseEnter = this.handleOptionMouseEnter.bind(this, index);
    }.bind(this));
    return {
      children: children,
      activedescendant: activedescendant,
      isEmpty: isEmpty
    };
  },
  getClassName: function() {
    var className = addClass(this.props.className, 'rf-combobox');
    if (this.state.isOpen)
      className = addClass(className, 'rf-combobox-is-open');
    return className;
  },
  clearSelectedState: function(cb) {
    this.setState({
      focusedIndex: null,
      inputValue: null,
      value: null,
      matchedAutocompleteOption: null,
      activedescendant: null
    }, cb);
  },
  handleInputChange: function(event) {
    var value = this.refs.input.getDOMNode().value;
    this.clearSelectedState(function() {
      this.props.onInput(value);
      if (!this.state.isOpen)
        this.showList();
    }.bind(this));
  },
  handleInputBlur: function() {
    var focusedAnOption = this.state.focusedIndex != null;
    if (focusedAnOption)
      return;
    this.maybeSelectAutocompletedOption();
    this.hideList();
  },
  handleOptionBlur: function() {
    this.blurTimer = setTimeout(this.hideList, 0);
  },
  handleOptionFocus: function() {
    clearTimeout(this.blurTimer);
  },
  handleInputKeyUp: function(event) {
    if (this.state.menu.isEmpty || event.keyCode === 8 || !this.props.autocomplete.match(/both|inline/))
      return;
    this.autocompleteInputValue();
  },
  autocompleteInputValue: function() {
    if (this.props.autocomplete == false || this.props.children.length === 0)
      return;
    var input = this.refs.input.getDOMNode();
    var inputValue = input.value;
    var firstChild = this.props.children.length ? this.props.children[0] : this.props.children;
    var label = getLabel(firstChild);
    var fragment = matchFragment(inputValue, label);
    if (!fragment)
      return;
    input.value = label;
    input.setSelectionRange(inputValue.length, label.length);
    this.setState({matchedAutocompleteOption: firstChild});
  },
  handleButtonClick: function() {
    this.state.isOpen ? this.hideList() : this.showList();
    this.focusInput();
  },
  showList: function() {
    if (this.props.autocomplete.match(/both|list/))
      this.setState({isOpen: true});
  },
  hideList: function() {
    this.setState({isOpen: false});
  },
  hideOnEscape: function() {
    this.hideList();
    this.focusInput();
  },
  focusInput: function() {
    this.refs.input.getDOMNode().focus();
  },
  selectInput: function() {
    this.refs.input.getDOMNode().select();
  },
  inputKeydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    27: 'hideOnEscape',
    13: 'selectOnEnter'
  },
  optionKeydownMap: {
    38: 'focusPrevious',
    40: 'focusNext',
    13: 'selectOption',
    27: 'hideOnEscape'
  },
  handleKeydown: function(event) {
    var handlerName = this.inputKeydownMap[event.keyCode];
    if (!handlerName)
      return;
    event.preventDefault();
    this.setState({usingKeyboard: true});
    this[handlerName].call(this);
  },
  handleOptionKeyDown: function(child, event) {
    var handlerName = this.optionKeydownMap[event.keyCode];
    if (!handlerName) {
      this.selectInput();
      return;
    }
    event.preventDefault();
    this.setState({usingKeyboard: true});
    this[handlerName].call(this, child);
  },
  handleOptionMouseEnter: function(index) {
    if (this.state.usingKeyboard)
      this.setState({usingKeyboard: false});
    else
      this.focusOptionAtIndex(index);
  },
  selectOnEnter: function() {
    this.maybeSelectAutocompletedOption();
    this.refs.input.getDOMNode().select();
  },
  maybeSelectAutocompletedOption: function() {
    if (!this.state.matchedAutocompleteOption)
      return;
    this.selectOption(this.state.matchedAutocompleteOption, {focus: false});
  },
  selectOption: function(child, options) {
    options = options || {};
    this.setState({
      value: child.props.value,
      inputValue: getLabel(child),
      matchedAutocompleteOption: null
    }, function() {
      this.props.onSelect(child.props.value, child);
      this.hideList();
      if (options.focus !== false)
        this.selectInput();
    }.bind(this));
  },
  focusNext: function() {
    if (this.state.menu.isEmpty)
      return;
    var index = this.state.focusedIndex == null ? 0 : this.state.focusedIndex + 1;
    this.focusOptionAtIndex(index);
  },
  focusPrevious: function() {
    if (this.state.menu.isEmpty)
      return;
    var last = this.props.children.length - 1;
    var index = this.state.focusedIndex == null ? last : this.state.focusedIndex - 1;
    this.focusOptionAtIndex(index);
  },
  focusSelectedOption: function() {
    var selectedIndex;
    React.Children.forEach(this.props.children, function(child, index) {
      if (child.props.value === this.state.value)
        selectedIndex = index;
    }.bind(this));
    this.showList();
    this.setState({focusedIndex: selectedIndex}, this.focusOption);
  },
  findInputValue: function(value) {
    value = value || this.props.value;
    var inputValue;
    React.Children.forEach(this.props.children, function(child) {
      if (child.props.value === value)
        inputValue = getLabel(child);
    });
    return inputValue || value;
  },
  focusOptionAtIndex: function(index) {
    if (!this.state.isOpen && this.state.value)
      return this.focusSelectedOption();
    this.showList();
    var length = this.props.children.length;
    if (index === -1)
      index = length - 1;
    else if (index === length)
      index = 0;
    this.setState({focusedIndex: index}, this.focusOption);
  },
  focusOption: function() {
    var index = this.state.focusedIndex;
    this.refs.list.getDOMNode().childNodes[index].focus();
  },
  render: function() {
    return (React.DOM.div({className: this.getClassName()}, React.DOM.input({
      ref: "input",
      className: "rf-combobox-input",
      defaultValue: this.props.value,
      value: this.state.inputValue,
      onChange: this.handleInputChange,
      onBlur: this.handleInputBlur,
      onKeyDown: this.handleKeydown,
      onKeyUp: this.handleInputKeyUp,
      role: "combobox",
      'aria-activedescendant': this.state.menu.activedescendant,
      'aria-autocomplete': this.props.autocomplete,
      'aria-owns': this.state.listId
    }), React.DOM.span({
      'aria-hidden': "true",
      className: "rf-combobox-button",
      onClick: this.handleButtonClick
    }, "▾"), React.DOM.div({
      id: this.state.listId,
      ref: "list",
      className: "rf-combobox-list",
      'aria-expanded': this.state.isOpen + '',
      role: "listbox"
    }, this.state.menu.children)));
  }
});
function getLabel(component) {
  var hasLabel = component.props.label != null;
  return hasLabel ? component.props.label : component.props.children;
}
function matchFragment(userInput, firstChildLabel) {
  userInput = userInput.toLowerCase();
  firstChildLabel = firstChildLabel.toLowerCase();
  if (userInput === '' || userInput === firstChildLabel)
    return false;
  if (firstChildLabel.toLowerCase().indexOf(userInput.toLowerCase()) === -1)
    return false;
  return true;
}

//# sourceMappingURL=<compileOutput>


},{"./add-class":1,"./option":4}],3:[function(require,module,exports){
"use strict";
module.exports = {
  Combobox: require('./combobox'),
  Option: require('./option')
};

//# sourceMappingURL=<compileOutput>


},{"./combobox":2,"./option":4}],4:[function(require,module,exports){
"use strict";
var addClass = require('./add-class');
module.exports = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
    label: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      role: 'option',
      tabIndex: '-1',
      className: 'rf-combobox-option',
      isSelected: false
    };
  },
  render: function() {
    var props = this.props;
    if (props.isSelected)
      props.className = addClass(props.className, 'rf-combobox-selected');
    return React.DOM.div(props);
  }
});

//# sourceMappingURL=<compileOutput>


},{"./add-class":1}]},{},[3])(3)
});