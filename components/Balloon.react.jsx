'use strict';

import React, {PropTypes} from 'react';
import 'react/addons';
import {getOffsetLeft, getOffsetTop, getWidth, getHeight} from 't11e-utils/lib/DOMUtils';

const classSet = React.addons.classSet;

const Balloon = React.createClass({

  propTypes: {
    parentElement: PropTypes.object.isRequired,
    placement: PropTypes.oneOf(['below', 'above']).isRequired,
    children: PropTypes.element.isRequired
  },

  getDefaultProps() {
    return {
      placement: 'above'
    };
  },

  getInitialState() {
    return {
      active: false
    };
  },

  componentDidMount() {
    // This forces recalculation of placement
    this.setState({active: true});
  },

  componentWillReceiveProps(nextProps) {
    // This forces recalculation of placement
    setTimeout(() => {
      if (this.isMounted()) {
        this.forceUpdate();
      }
    }, 0);
  },

  render() {
    const element = this.isMounted() ? this.getDOMNode() : null;
    const parentElement = this.props.parentElement;

    const x = getOffsetLeft(parentElement);
    const y = getOffsetTop(parentElement);
    const w = getWidth(parentElement);
    const h = getHeight(parentElement);

    const ww = element ? getWidth(element) : 0;
    const hh = element ? getHeight(element) : 0;

    let style = {
      left: x - ww / 2 + (w / 2),
      top: this.props.placement === 'above' ?
        y - h - hh : y + h
    };
    if (!element) {
      style.visibility = 'hidden';
    }

    const arrow = this.props.placement === 'above' ? 'below' : 'above';

    return (
      <div className={classSet({
        'Balloon': true,
        'Balloon_active': this.state.active
      })} style={style} data-arrow={arrow}>
        {this.props.children}
      </div>
    );
  }
});

export default Balloon;
