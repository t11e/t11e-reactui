'use strict';

import domEvent from 'dom-event';
import {DOMUtils} from 't11e-utils';

export const WindowScrollEventMixin = {
  getInitialState() {
    return this._computeState();
  },

  componentDidMount() {
    domEvent.on(window, 'scroll', this._windowScrollEventMixin_handleWindowScroll);
    this._windowScrollEventMixin_handleWindowScroll();
  },

  componentWillUnmount() {
    domEvent.off(window, 'scroll', this._windowScrollEventMixin_handleWindowScroll);
  },

  _windowScrollEventMixin_handleWindowScroll() {
    this.setState(this._computeState());
  },

  _computeState() {
    return {
      windowScrollTop: DOMUtils.getWindowScrollTop()
    };
  }
};

export default WindowScrollEventMixin;
