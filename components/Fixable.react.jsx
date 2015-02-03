'use strict';

var React = require('react');
var $ = require('jquery');
var domEvent = require('dom-event');
var DOMUtils = require('t11e-utils').DOMUtils;

var WindowResizeEventMixin = require('../lib/mixins/WindowResizeEventMixin');

var Fixable = React.createClass({

  mixins: [WindowResizeEventMixin],

  getDefaultProps: function() {
    return {
      container: null,
      scrollContext: null,
      zIndex: 10000
    };
  },

  getInitialState: function() {
    return {
      fixed: false,
      originalTop: null,
      width: null,
      height: null
    };
  },

  componentDidMount: function() {
    domEvent.on(this._getScrollContainer(), 'scroll', this._handleDocumentScroll);
    domEvent.on(this._getScrollContainer(), 'touchmove', this._handleDocumentScroll);
    // When a user swipes very fast, and lets go of the touch event
    domEvent.on(this._getScrollContainer(), 'touchend', this._handleDocumentScroll);
  },

  componentWillUnmount: function() {
    domEvent.off(this._getScrollContainer(), 'scroll', this._handleDocumentScroll);
    domEvent.off(this._getScrollContainer(), 'touchmove', this._handleDocumentScroll);
    // When a user swipes very fast, and lets go of the touch event
    domEvent.off(this._getScrollContainer(), 'touchend', this._handleDocumentScroll);
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.fixed && this.isMounted() && (
      this.state.windowWidth !== prevState.windowWidth ||
      this.state.windowHeight !== prevState.windowHeight)) {
      // TODO: Should this not just set state.width?
      var element = this.getDOMNode();
      element.style.width = DOMUtils.getWidth(element.parentNode) + 'px';
    }
  },

  render: function() {
    if (this.state.fixed) {
      return (
        <section className='Fixable' data-fixed={true}>
          <div className='Fixable_content' style={{
            position: 'fixed',
            top: 0,
            width: this.state.width,
            height: this.state.height,
            zIndex: this.props.zIndex
          }}>
            {this.props.children}
          </div>
          <div className='Fixable_placeholder' style={{
            width: this.state.width,
            height: this.state.height
          }}/>
        </section>
      );
    } else {
      var resetStyle = {width: 'auto'};  // Works around React bug where style isn't removed
      return (
        <section className='Fixable' data-fixed={false} style={resetStyle}>
          <div className='Fixable_content'>
            {this.props.children}
          </div>
        </section>
      );
    }
  },

  _handleDocumentScroll: function(event) {
    if (this.isMounted()) {
      var $el = $(this.getDOMNode());
      if ($el.is(':visible')) {
        if (this.state.originalTop === null) {
          var $container = $(this._getScrollContainer());
          var containerTop = $container.offset() ? $container.offset().top : 0;
          this.setState({originalTop: Math.max(0, $el.offset().top - containerTop)});
        }
        var fix = this._shouldBeFixed();
        if (fix != this.state.fixed) {
          this.setState({
            fixed: fix,
            width: $el.outerWidth(),
            height: $el.outerHeight()
          });
        }
      }
    }
  },

  _shouldBeFixed: function() {
    var scrollTop = $(this._getScrollContainer()).scrollTop();
    if (this.props.container && !this.state.fixed) {
      // Only fix if height is larger than a certain height
      var $el = $(this.getDOMNode());
      var $container = $(this.props.container.getDOMNode());
      var containerHeight = $container.outerHeight();
      var top = 0;
      if (top + $el.outerHeight() > $container.offset().top + $container.outerHeight() - scrollTop) {
        return false;
      }
    }
    return scrollTop > this.state.originalTop;
  },

  _getScrollContainer: function() {
    if (this.props.scrollContext) {
      var container = this.props.scrollContext.getScrollContainer();
      if (container && container.getDOMNode) {
        return container.getDOMNode();
      }
    }
    return window;
  }

});

module.exports = Fixable;
