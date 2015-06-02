'use strict';

import React from 'react';
import $ from 'jquery';
import domEvent from 'dom-event';
import {getOffsetTop, getWidth, getHeight} from 't11e-utils/lib/DOMUtils';

import {WindowResizeEventMixin} from '../lib/mixins/WindowResizeEventMixin';

function computeHeight(element) {
  const style = window.getComputedStyle(element);
  return getHeight(element) + parseInt(style['margin-top']) + parseInt(style['margin-bottom']);
}

export const Fixable = React.createClass({

  mixins: [WindowResizeEventMixin],

  propTypes: {
    zIndex: React.PropTypes.number.isRequired,
    target: React.PropTypes.oneOf(['top', 'bottom']),
    scrollContext: React.PropTypes.element,
    container: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      container: null,
      scrollContext: null,
      zIndex: 10000
    };
  },

  getInitialState() {
    return {
      fixed: false,
      originalTop: null,
      originalBottom: null,
      originalWidth: null,
      originalHeight: null,
      placeholderWidth: null,
      placeholderHeight: null
    };
  },

  componentDidMount() {
    const scrollContainer = this._getScrollContainer();
    domEvent.on(scrollContainer, 'scroll', this._handleDocumentScroll);
    domEvent.on(scrollContainer, 'touchmove', this._handleDocumentScroll);
    // When a user swipes very fast, and lets go of the touch event
    domEvent.on(scrollContainer, 'touchend', this._handleDocumentScroll);
  },

  componentWillUnmount() {
    const scrollContainer = this._getScrollContainer();
    domEvent.off(scrollContainer, 'scroll', this._handleDocumentScroll);
    domEvent.off(scrollContainer, 'touchmove', this._handleDocumentScroll);
    // When a user swipes very fast, and lets go of the touch event
    domEvent.off(scrollContainer, 'touchend', this._handleDocumentScroll);
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.fixed && this.isMounted() && (
      this.state.windowWidth !== prevState.windowWidth ||
      this.state.windowHeight !== prevState.windowHeight)) {
      // TODO: Should this not just set state.width?
      /*
      const element = this.getDOMNode();
      element.style.width = DOMUtils.getWidth(element.parentNode) + 'px';
      */
    }
  },

  render() {
    if (this.state.fixed) {
      const {target} = this.props;
      return (
        <section className='Fixable' data-fixed={true}>
          <div className='Fixable_content' style={{
            position: 'fixed',
            top: target === 'top' ? 0 : null,
            bottom: target === 'bottom' ? 0 : null,
            width: this.state.originalWidth,
            height: this.state.originalHeight,
            zIndex: this.props.zIndex
          }}>
            {this.props.children}
          </div>
          <div className='Fixable_placeholder' style={{
            width: this.state.placeholderWidth,
            height: this.state.placeholderHeight
          }}/>
        </section>
      );
    } else {
      const resetStyle = {width: 'auto'};  // Works around React bug where style isn't removed
      return (
        <section className='Fixable' data-fixed={false} style={resetStyle}>
          <div className='Fixable_content'>
            {this.props.children}
          </div>
        </section>
      );
    }
  },

  _handleDocumentScroll(event) {
    if (this.isMounted()) {
      const element = this.getDOMNode();
      if ($(element).is(':visible')) {
        if (this.state.originalTop === null) {
          const $scrollContainer = $(this._getScrollContainer());
          const scrollContainerTop = $scrollContainer.offset() ? $scrollContainer.offset().top : 0;
          this.setState({originalTop: Math.max(0, getOffsetTop(element) - scrollContainerTop)});
        }

        const fix = this._shouldBeFixed();
        if (fix !== this.state.fixed) {
          let [width, height] = [getWidth(element), getHeight(element)];
          this.setState({
            fixed: fix,
            originalWidth: width,
            originalHeight: height,
            placeholderWidth: width === getWidth(element.parentElement) ? '100%' : width,
            placeholderHeight: height
          });
        }
      }
    }
  },

  _shouldBeFixed() {
    const scrollTop = $(this._getScrollContainer()).scrollTop();
    const element = this.getDOMNode();
    const height = computeHeight(element);

    let container = this.props.container;
    if (container && !this.state.fixed) {
      // Only fix if height is larger than a certain height
      const top = 0;
      const $container = $(container.getDOMNode());
      return !(top + height > $container.offset().top + $container.outerHeight() - scrollTop);
    } else {
      const scrollContainerHeight = getHeight(this._getScrollContainer());
      switch (this.props.target) {
        case 'top':
          return scrollTop > this.state.originalTop;

        case 'bottom':
          return scrollTop + scrollContainerHeight - height < this.state.originalTop;
      }
    }
  },

  _getScrollContainer() {
    if (this.props.scrollContext) {
      const scrollContainer = this.props.scrollContext.getScrollContainer();
      if (scrollContainer && scrollContainer.getDOMNode) {
        return scrollContainer.getDOMNode();
      }
    }
    return window;
  }

});

export default Fixable;
