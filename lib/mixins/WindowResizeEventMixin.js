'use strict';

import domEvent from 'dom-event';
import {DOMUtils} from 't11e-utils';

export const WindowResizeEventMixin = {
  getInitialState() {
    return this._computeWindowSizeState();
  },

  componentDidMount() {
    domEvent.on(window, 'resize', this._windowResizeEventMixin_handleResize);
    this._windowResizeEventMixin_handleResize();
  },

  componentWillUnmount() {
    domEvent.off(window, 'resize', this._windowResizeEventMixin_handleResize);
  },

  _windowResizeEventMixin_handleResize() {
    this.setState(this._computeWindowSizeState());
  },

  _computeWindowSizeState() {
    return {
      windowWidth: DOMUtils.getWindowWidth(),
      windowHeight: DOMUtils.getWindowHeight()
    };
  }
};

export default WindowResizeEventMixin;
