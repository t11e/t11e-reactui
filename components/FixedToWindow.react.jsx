'use strict';

import React from 'react';
import {getHeight} from 't11e-utils/lib/DOMUtils';

import WindowResizeEventMixin from '../lib/mixins/WindowResizeEventMixin';

const FixedToWindow = React.createClass({

  mixins: [WindowResizeEventMixin],

  propTypes: {
    children: React.PropTypes.node,
    position: React.PropTypes.oneOf(['top', 'bottom'])
  },

  getInitialState() {
    return {
      height: null
    };
  },

  componentDidMount() {
    this._updateHeight();
  },

  componentDidUpdate(prevProps, prevState) {
    this._updateHeight();
  },

  render() {
    return (
      <div className='FixedToWindow' data-position={this.props.position}>
        <div className='FixedToWindow_placeholder' style={{height: this.state.height}}></div>
        <div className='FixedToWindow_content' data-position={this.props.position} ref='content'>
          {this.props.children}
        </div>
      </div>
    );
  },

  _updateHeight() {
    if (this.refs.content) {
      const height = getHeight(this.refs.content.getDOMNode());
      if (height !== this.state.height) {
        this.setState({height});
      }
    }
  }

});

export default FixedToWindow;
