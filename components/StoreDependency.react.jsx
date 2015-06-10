'use strict';

import React from 'react';
import 'react/addons';

import Spinner from './Spinner.react';

/**
 * Conditionally presents children depending on store state. When store is not
 * available, it shows a message.
 *
 * The store must:
 *
 * 1. Have the attribute `state`, which must be one of `ready`, `loading`, `loaded` or
 *    `error`.
 * 2. Emit a `changed` event whenever its state changes.
 *
 * The `errorMessage` is customizable.
 *
 * If you supply `inline`, it will be rendered small, suitable for inline cases.
 *
 * If you supply `item`, it will assume that when the state is `loaded`, an absent item
 * means "not found".
 *
 * If you supply `items`, it will assume that when the state is `loaded`, an empty
 * item array means "empty".
 */
const StoreDependency = React.createClass({

  propTypes: {
    store: React.PropTypes.object.isRequired,
    item: React.PropTypes.object,
    items: React.PropTypes.array,
    errorMessage: React.PropTypes.string,
    children: React.PropTypes.node,
    inline: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      inline: false
    };
  },

  getInitialState() {
    return {
      storeState: this.props.store.state
    };
  },

  componentDidMount() {
    this.props.store.addListener('changed', this._handleChanged);
  },

  componentWillUnmount() {
    this.props.store.removeListener('changed', this._handleChanged);
  },

  render() {
    let content;
    switch (this.state.storeState) {
      case 'loading':
        content = (
          <div className='StoreDependency_loading'>
            {
              !this.props.inline &&
                <Spinner title='Loading…'/>
            }
          </div>
        );
        break;

      case 'loaded':
        if ((this.props.item === undefined && this.props.items === undefined) ||
          (this.props.item || (this.props.items && this.props.items.length))) {
          content = (
            <div className='StoreDependency_content'>
              {this.props.children}
            </div>
          );
        } else {
          content = (
            <div className='StoreDependency_empty'>
              {
                (this.props.items && this.props.items.length === 0) ?
                  <h1>{'Empty.'}</h1>
                  :
                  <h1>{'Not found.'}</h1>
              }
            </div>
          );
        }
        break;

      case 'error':
        const errorMessage = this.props.errorMessage ||
          (this.props.inline ? 'Unavailable.' :
            'Could not show this view due to an error.');

        content = (
          <div className='StoreDependency_error'>
            <h1>{errorMessage}</h1>
          </div>
        );
        break;

      default:
        content = null;
    }

    return (
      <div className='StoreDependency' data-inline={this.props.inline}>
        {content}
      </div>
    );
  },

  _handleChanged() {
    this.setState({storeState: this.props.store.state});
  }

});

export default StoreDependency;
