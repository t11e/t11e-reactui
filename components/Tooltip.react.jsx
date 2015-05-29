'use strict';

import React from 'react';
import {getOffsetTop, getOffsetLeft, getWidth} from 't11e-utils/lib/DOMUtils';
import {ScheduledFunction} from 't11e-utils';

import LayeredComponentMixin from '../lib/mixins/LayeredComponentMixin';
import WindowResizeEventMixin from '../lib/mixins/WindowResizeEventMixin';
import WindowScrollEventMixin from '../lib/mixins/WindowScrollEventMixin';
import Floater from './Floater.react';

const Tooltip = React.createClass({

  mixins: [LayeredComponentMixin, WindowResizeEventMixin, WindowScrollEventMixin],

  propTypes: {
    children: React.PropTypes.node.isRequired,
    content: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      visible: false
    };
  },

  componentDidMount() {
    this._showFn = ScheduledFunction.wrap(this._show);
  },

  componentWillUnmount() {
    this._showFn.stop();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.windowWidth !== prevState.windowWidth ||
      this.state.windowScrollTop !== prevState.windowScrollTop) {
      this._hide();
    }
  },

  render() {
    return (
      <section onMouseOver={this._handleMouseOver} onMouseOut={this._handleMouseOut}>
        {this.props.children}
      </section>
    );
  },

  renderLayer(props) {
    if (this.state.visible) {
      const element = this.getDOMNode();
      const style = {
        position: 'absolute',
        left: getOffsetLeft(element),
        top: getOffsetTop(element),
        width: getWidth(element),
        zIndex: props.zIndex
      };
      return (
        <Floater zIndex={props.zIndex} open={true}>
          <div className='Tooltip' style={style}>
            <div className='Tooltip_box'>
              <div className='Tooltip_content'>
                {this.props.content}
              </div>
            </div>
          </div>
        </Floater>
      );
    } else {
      return null;
    }
  },

  _show() {
    if (!this.state.visible) {
      this.setState({visible: true});
    }
  },

  _hide() {
    if (this.state.visible) {
      this.setState({visible: false});
    }
  },

  _handleMouseOver(event) {
    this._showFn.schedule(500);
  },

  _handleMouseOut(event) {
    this._showFn.stop();
    this._hide();
  }

});

export default Tooltip;
