'use strict';

var React = require('react');
var ApplicationDispatcher = require('t11e-appcore').ApplicationDispatcher;

var PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');

var Button = React.createClass({

  mixins: [PreventSelectionMixin],

  propTypes: {
    enabled: React.PropTypes.bool,
    title: React.PropTypes.string,
    href: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    className: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      enabled: true,
      title: null,
      label: null,
      className: null
    };
  },

  render: function() {
    return (
      <a className={'button' + (this.props.className ? ' ' + this.props.className : '')}
        target="_blank"
        disabled={!this.props.enabled}
        title={this.props.title || this.props.label}
        onClick={this.props.onClick || this._handeClick}>
        {this.props.label}
      </a>
    );
  },

  _handeClick: function(event) {
    if (this.props.href) {
      ApplicationDispatcher.action('navigate', {
        path: this.props.href
      });
      event.preventDefault();
    }
  }

});

module.exports = Button;
