'use strict';

var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var DOMUtils = require('t11e-utils').DOMUtils;

var LayeredComponentMixin = require('../lib/mixins/LayeredComponentMixin');

var START_ZINDEX = 50000;

var Floater = React.createClass({

  getDefaultProps: function() {
    return {
      offsetX: 0,
      offsetY: 0,
      keepWithinViewport: true,
      parentElement: null,
      parentRef: null,
      placement: null,
      captureFormEnter: false,
      onShow: null,
      onHide: null,
      open: false,
      useParentWidth: true,
      className: null,
      zIndex: null,
      handleClicks: true
    };
  },

  getInitialState: function() {
    return {
      open: this.props.open,
      closing: false,
      style: {}
    };
  },

  componentDidMount: function() {
    // Defer setup slightly to avoid getting any events that are in flight
    window.setTimeout(this._addHooks, 0);

    this.updatePosition();
  },

  componentWillUnmount: function() {
    this._removeHooks();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.open !== this.state.open) {
      if (this.state.open) {
        if (this.props.onShow) {
          window.setTimeout(function() { this.props.onShow(); }.bind(this), 1);
        }
      } else {
        if (this.props.onHide) {
          window.setTimeout(function() { this.props.onHide(); }.bind(this), 1);
        }
      }
    }

    this.updatePosition();
  },

  render: function() {
    if (this.state.open) {
      var style = this.state.style;
      if (this.state.closing) {
        // Trick to avoid click events not bubbling up to other event handlers
        // when hiding the floater right before close.
        style = _.extend({}, style, {
          visibility: 'hidden'
        });
      }
      return (
        <div className={this.props.className}
          ref='floater'
          style={style}>
          {this.props.children}
        </div>
      );
    } else {
      return (
        <div ref='floater' style={{'display': 'none'}}/>
      );
    }
  },

  open: function() {
    if (this.isMounted() && !this.state.open) {
      this.setState({open: true});
    }
  },

  close: function() {
    if (this.isMounted() && this.state.open) {
      this.setState({open: false});
    }
  },

  remove: function() {
    var self = this;
    if (this.isMounted()) {
      window.setTimeout(function() {
        var parentNode = self.getDOMNode().parentNode;
        React.unmountComponentAtNode(parentNode);
        $(parentNode).remove();
      }, 10);
    }
  },

  _addHooks: function() {
    if (this.isMounted()) {
      this._hooked = true;  // We use a variable here to avoid race conditions

      $(this.getDOMNode()).on('click', this._handleClick);
      $(this.getDOMNode()).find('input, button, select')
        .on('keydown', this._handleFieldKeyDown);

      $(window).on('resize', this._handleWindowResize);
      $(document.body).on('keydown', this._handleDocumentKeyDown);
      if (this.props.handleClicks) {
        $(document.body).on('mousedown', this._handleDocumentMouseDown);
        $(document.body).on('touchstart', this._handleDocumentTouchStart);
      }
    }
  },

  _removeHooks: function() {
    if (this._hooked) {
      if (this.isMounted()) {
        $(this.getDOMNode()).find('input, button, select')
          .off('keydown', this._handleFieldKeyDown);
        $(this.getDOMNode()).off('click', this._handleClick);
      }

      if (this.props.handleClicks) {
        $(document.body).off('touchstart', this._handleDocumentTouchStart);
        $(document.body).off('mousedown', this._handleDocumentMouseDown);
      }
      $(document.body).off('keydown', this._handleDocumentKeyDown);
      $(window).off('resize', this._handleWindowResize);

      this._hooked = false;
    }
  },

  updatePosition: function() {
    var floaterRef = this.refs.floater;
    if (!floaterRef) {
      return;
    }

    var style = {
      position: 'absolute',
      zIndex: this.props.zIndex
    };

    var $el = $(this._findParentElement());
    var $floater = $(floaterRef.getDOMNode());
    if ($el.length > 0 && $floater.length > 0) {
      var offsetX = this.props.offsetX || 0;
      var offsetY = this.props.offsetY || 0;

      var placement = this.props.placement || ['bottom', 'left'];
      if (placement.indexOf('bottom') !== -1) {
        style.top = $el.offset().top + $el.outerHeight();
      } else if (placement.indexOf('top') !== -1) {
        style.top = $el.offset().top;
      } else if (placement.indexOf('middle') !== -1) {
        style.top = $el.offset().top + $el.outerHeight() / 2 - $floater.outerHeight() / 2;
      }
      style.top += offsetY;

      if (placement.indexOf('left') !== -1) {
        style.left = $el.offset().left;
      } else if (placement.indexOf('right') !== -1) {
        style.left = $el.offset().left + $el.outerWidth() - $floater.outerWidth();
      } else if (placement.indexOf('leftOf') !== -1) {
        style.left = $el.offset().left - $floater.outerWidth();
      } else if (placement.indexOf('rightOf') !== -1) {
        style.left = $el.offset().left + $el.outerWidth();
      } else if (placement.indexOf('center') !== -1) {
        style.left = $el.offset().left + $el.outerWidth() / 2 - $floater.outerWidth() / 2;
      }
      style.left += offsetX;

      if (this.props.keepWithinViewport) {
        if (style.left < 0) {
          style.left = 0;
        } else if (style.left + $floater.outerWidth() > $(window).outerWidth()) {
          style.left = $(window).outerWidth() - $floater.outerWidth();
        }
      }

      if (this.props.useParentWidth) {
        style.minWidth = $el.outerWidth();
      }

      if (!_.isEqual(style, this.state.style)) {
        this.setState({style: style});
      }
    }
  },

  _handleClick: function(event) {
    if (this._blurTimeoutId) {
      // If we got any clicks, we should cancel any pending blur
      window.clearTimeout(this._blurTimeoutId);
      this._blurTimeoutId = null;
    }
  },

  _handleDocumentMouseDown: function(event) {
    if (this.isMounted() && this.state.open && !this._isEventInside(event)) {
      this._scheduleClose();
    }
  },

  _handleDocumentTouchStart: function(event) {
    if (event.originalEvent) {
      event = event.originalEvent;
    }
    if (event.touches.length === 1 &&
      !this._isEventInside(event.touches.item(0))) {
      this._scheduleClose();
    }
  },

  _handleDocumentKeyDown: function(event) {
    if (event.keyCode === 27) {
      this.close();
      event.preventDefault();
    }
  },

  _handleFieldKeyDown: function(event) {
    if (event.keyCode === 13) {
      window.setTimeout(this.close, 500);
      event.preventDefault();
    }
  },

  _handleWindowResize: function(event) {
    if (this.isMounted() && this.state.open) {
      this.updatePosition();
    }
  },

  _findParentElement: function() {
    if (this.props.parentElement) {
      return this.props.parentElement;
    } else if (this.props.parentRef && this.props.parentRef.isMounted()) {
      return this.props.parentRef.getDOMNode();
    } else {
      return null;
    }
  },

  _isEventInside: function(eventOrTouch) {
    var element = eventOrTouch.target;

    // FIXME: We should have a global event handler that correly "unrolls" the
    //   top-level floater when we click outside it.
    if (DOMUtils.isElementOrInside(element,
      LayeredComponentMixin.getStackElement())) {
      return true;
    }

    var parentElement = this._findParentElement();
    if (parentElement) {
      return DOMUtils.isElementOrInside(element, parentElement);
    }
    return false;
  },

  _scheduleClose: function() {
    // TODO: We delay a little bit here to avoid valid clicks in other
    //   floaters to be canceled out. Should fix this properly.
    this.setState({closing: true});
    window.setTimeout(this.close, 100);
  }

});

module.exports = Floater;
