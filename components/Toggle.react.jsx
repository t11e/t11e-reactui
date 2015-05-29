'use strict';

import React from 'react';

import PreventSelectionMixin from '../lib/mixins/PreventSelectionMixin';

export const ToggleItem = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    enabled: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      enabled: true
    };
  },

  render() {
    return <span>{this.props.children}</span>;
  }

});

export const Toggle = React.createClass({

  mixins: [PreventSelectionMixin],

  propTypes: {
    children: React.PropTypes.node,
    value: React.PropTypes.any,
    values: React.PropTypes.arrayOf(React.PropTypes.any),
    onChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      items: [],
      value: null,
      onChange() {}
    };
  },

  getInitialState() {
    return {
      selectedValue: this.props.value
    };
  },

  componentDidMount() {
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value ||
      prevProps.values !== this.props.values ||
      this.state.selectedValue !== prevState.selectedValue) {
    }

    if (prevProps.value !== this.props.value) {
      this.setState({selectedValue: this.props.value});
    }

    if (this.props.onChange && prevState.selectedValue !== this.state.selectedValue) {
      this.props.onChange(this.state.selectedValue);
    }
  },

  render() {
    return (
      <div className='Toggle'
        data-value={this.state.selectedValue || 'null'}
        onMouseDown={this._handleMouseDown}>
        {
          React.Children.map(this.props.children, (item, itemIdx) => {
            return item && (
              <span key={itemIdx}
                className='Toggle_Item'
                onClick={item.props.enabled && this._handleItemClick.bind(this, item)}
                data-is-enabled={item.props.enabled}
                data-is-selected={item.props.value === this.state.selectedValue}
                data-value={item.props.value || 'null'}>
                {item}
              </span>
            );
          })
        }
      </div>
    );
  },

  _handleMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
  },

  _handleItemClick(item, event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      selectedValue: item.props.value
    });
  }

});

export default Toggle;
