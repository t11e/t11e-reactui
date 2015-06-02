'use strict';

import React from 'react';
import 'react/addons';

import Spinner from './Spinner.react';

/**
 * Conditionally presents children depending on store state. When store is not
 * available, it shows a message.
 */
const StoreDependency = React.createClass({

  propTypes: {
    store: React.PropTypes.object.isRequired,
    item: React.PropTypes.object,
    items: React.PropTypes.array,
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
        content = (
          <div className='StoreDependency_error'>
            <h1>{'Could not show this view due to an error.'}</h1>
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
