'use strict';

var $ = require('jquery');

var HoverStateMixin = {
  getInitialState: function() {
    return {
      hovering: false
    };
  },

  componentDidMount: function() {
    var self = this;
    $(this.getDOMNode()).hover(function() {
      self.setState({hovering: true});
    }, function () {
      self.setState({hovering: false});
    }).mouseleave();
  }
};

module.exports = HoverStateMixin;
