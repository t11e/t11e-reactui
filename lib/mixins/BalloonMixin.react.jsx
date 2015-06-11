'use strict';

import React from 'react';
import 'react/addons';
import DomEvent from 'dom-event';

import LayeredComponentMixin from './LayeredComponentMixin';
import Balloon from '../../components/Balloon.react';

const BalloonMixin = {

  mixins: [LayeredComponentMixin],

  getInitialState() {
    return {
      balloon: null
    };
  },

  componentDidMount() {
    DomEvent.on(this.getDOMNode(), 'mouseout', this._balloonMixinHandleMouseOut);
  },

  componentWillUnmount() {
    DomEvent.off(this.getDOMNode(), 'mouseout', this._balloonMixinHandleMouseOut);
  },

  renderLayer(props) {
    if (this.state.balloon) {
      return this.state.balloon;
    }
  },

  hideBalloon() {
    this.setState({hiding: true});
    this._closeTimeout = setTimeout(() => {
      this._closeTimeout = null;
      if (this.isMounted()) {
        this.setState({balloon: null});
      }
    }, 500);
  },

  showBalloon(contents, props) {
    if (!this.isMounted()) {
      return;
    }

    if (this._closeTimeout) {
      clearTimeout(this._closeTimeout);
    }

    let balloon = (
      <Balloon parentElement={this.getDOMNode()} {... props}>
        {contents}
      </Balloon>
    );
    this.setState({
      balloon: balloon,
      hiding: false
    });
  },

  _balloonMixinHandleMouseOut(event) {
    if (this.state.balloon && !this.state.hiding) {
      this.hideBalloon();
    }
  }

};

export default BalloonMixin;
