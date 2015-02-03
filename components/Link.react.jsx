'use strict';

var _ = require('underscore');
var React = require('react');
var ApplicationDispatcher = require('t11e-appcore').ApplicationDispatcher;

/**
 * This component creates an anchor tag that uses the navigation system.
 */
var Link = React.createClass({

  propTypes: {
    // The URL to link to.
    href: React.PropTypes.string,

    // Optional callback to call on clicks.
    onClick: React.PropTypes.func,

    // Event to dispatch on clicks.
    dispatchClickEvent: React.PropTypes.string,

    // Payload to send to the dispatched event.
    dispatchClickEventPayload: React.PropTypes.object
  },

  render: function() {
    var onClick = this.props.onClick;

    var dispatchClickEvent = this.props.dispatchClickEvent;
    var dispatchClickEventPayload = this.props.dispatchClickEventPayload;

    var props = _.extend(this.props, {
      onClick: function(event) {
        if (!(onClick && onClick(event) === false)) {
          if (dispatchClickEvent) {
            ApplicationDispatcher.action(dispatchClickEvent, dispatchClickEventPayload);
          }

          ApplicationDispatcher.action('navigate', {
            path: props.href
          });
        }
        event.preventDefault();
      }
    });

    return <a {...props}>{this.props.children}</a>;
  }

});

module.exports = Link;
