'use strict';

var $ = require('jquery');

module.exports = {

  componentDidMount: function() {
    $(this.getDOMNode())
      .on('selectstart', false)  // MSIE
      .css('user-select', 'none')
      .css('-moz-user-select', '-moz-none')
      .css('-moz-user-select', 'none')
      .css('-o-user-select', 'none')
      .css('-ms-user-select', 'none')
      .css('-webkit-user-select', 'none');
  }

};
