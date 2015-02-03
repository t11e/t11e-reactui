'use strict';

var _ = require('underscore');
var React = require('react');

var START_ZINDEX = 50000;

var stackElement;

function _getStackElement() {
  var element = stackElement;
  if (!element) {
    // TODO: We must add .enclosure_widget here get the style classes
    //   when embedded as widget. Make this more elegant and generic!
    element = (function() {
      stackElement = document.createElement('div');
      stackElement.className = 'enclosure_widget';
      document.body.appendChild(stackElement);
      return stackElement;
    })();
  }
  return element;
}

// Creates a special layer in a stack of layers in a different part of
// the DOM tree, and maintains the props transfer. Useful for floaters
// and modals that need to be rendered by another component.
var LayeredComponentMixin = {
  componentWillUnmount: function() {
    this._unrenderLayer();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this._renderLayer();
  },

  componentDidMount: function() {
    this._renderLayer();
  },

  _renderLayer: function() {
    var zIndexes = _.map(_getStackElement().childNodes, function(child) {
      return parseInt(child.style.zIndex);
    });
    var zIndex = zIndexes.length > 0 ? _.max(zIndexes) + 1 : START_ZINDEX;

    var layer = this.renderLayer({zIndex: zIndex});
    if (layer) {
      if (!this._layerElement) {
        this._layerElement = document.createElement('div');
        _getStackElement().appendChild(this._layerElement);
      }
      this._layerElement.style.zIndex = zIndex;
      React.render(layer, this._layerElement);
    } else {
      this._unrenderLayer();
    }
  },

  _unrenderLayer: function() {
    var element = this._layerElement;
    if (element) {
      this._layerElement = null;
      React.unmountComponentAtNode(element);
      element.parentNode.removeChild(element);
    }
  }
};

// Returns the global stack container element.
LayeredComponentMixin.getStackElement = _getStackElement;

module.exports = LayeredComponentMixin;
