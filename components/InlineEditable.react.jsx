'use strict';

import React from 'react';
import 'react/addons';
import {DOMUtils} from 't11e-utils';

const InlineEditable = React.createClass({

  propTypes: {
    children: React.PropTypes.node.isRequired,
    label: React.PropTypes.node,
    actionLabel: React.PropTypes.node,
    editable: React.PropTypes.bool,
    onBeginEdit: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      editable: true,
      actionLabel: 'Edit'
    };
  },

  getInitialState() {
    return {
      editing: false
    };
  },

  componentDidUpdate(prevProps, prevState) {
    let {onBeginEdit} = this.props;
    if (onBeginEdit && this.state.editing && !prevState.editing) {
      onBeginEdit();
    }
  },

  render() {
    const {editable, actionLabel} = this.props;
    const {editing} = this.state;

    return (
      <span className='InlineEditable'
        data-editable={editable}
        data-editing={editing}>
        <span className='InlineEditable_editor'>
          {this.props.children}
        </span>
        <label>{this.props.label}</label>
        {
          editable &&
            <a href='#' title={actionLabel}
              onClick={this._handleToggleEditLinkClick}/>
        }
      </span>
    );
  },

  done() {
    if (this.isMounted() && this.state.editing) {
      this.setState({editing: false});
    }
  },

  _handleToggleEditLinkClick() {
    this.setState({editing: !this.state.editing});
  }

});

export default InlineEditable;
