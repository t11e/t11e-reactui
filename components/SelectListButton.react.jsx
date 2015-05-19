'use strict';

import React from 'react';
import {isArray, compact, contains} from 'underscore';

let DropdownMenuButton = require('./DropdownMenuButton.react');
let SelectList = require('./SelectList.react');

let SelectListButton = React.createClass({

  propTypes: {
    labelAttribute: React.PropTypes.string.isRequired,
    labelTemplate: React.PropTypes.func,
    itemTemplate: React.PropTypes.func,
    unsetLabel: React.PropTypes.string,
    items: React.PropTypes.array,
    loading: React.PropTypes.bool,
    multiSelect: React.PropTypes.bool,
    groupBy: React.PropTypes.func,
    groupTemplate: React.PropTypes.func,
    onChange: React.PropTypes.func.isRequired,
    values: React.PropTypes.array,
    treatValuesAsStrings: React.PropTypes.bool.isRequired
  },

  getDefaultProps: function() {
    return {
      // TODO: Legacy mode. Port apps to not use this.
      treatValuesAsStrings: true,
      items: [],
      unsetLabel: '',
      labelTemplate: null,
      labelAttribute: 'label',
      multiSelect: false,
      groupBy: () => null,
      groupTemplate: group => group.toString(),
      itemTemplate: item => {
        return (
          <a>
            <span>{item[this.labelAttribute || 'label']}</span>
            <span className='count'>{item.count !== 0 ? item.count : ''}</span>
          </a>
        );
      },
      onChange: () => {}
    };
  },

  getInitialState: function() {
    return {
      values: []
    };
  },

  componentDidMount: function() {
    this._updateValues(this.props.values);
  },

  componentWillReceiveProps: function(nextProps) {
    this._updateValues(nextProps.values);
  },

  render: function() {
    return (
      <DropdownMenuButton
        label={this._formatLabel()}
        ref='button'
        isValueButton={true}
        loading={this.props.loading}>
        <SelectList
          items={this.props.items}
          groupBy={this.props.groupBy}
          groupTemplate={this.props.groupTemplate}
          multiSelect={this.props.multiSelect}
          selectedItems={this._getSelectedItems()}
          onSelectionChange={this._handleSelectionChange}
          template={this.props.itemTemplate}/>
      </DropdownMenuButton>
    );
  },

  _updateValues: function(values) {
    if (this.props.treatValuesAsStrings) {
      values || (values = []);

      // TODO: We translate somewhat awkwardly between "raw" values from the
      //   props and the actual cooked item used by the select list. This
      //   entails converting them to strings. We should always use clean,
      //   cooked items.
      if (!isArray(values)) {
        values = [values];
      }
      values = compact(values).map(v => '' + v);
    }
    this.setState({values});
  },

  _getSelectedItems: function() {
    if (this.props.treatValuesAsStrings) {
      let items = [];
      for (let i = 0; i < this.props.items.length; i++) {
        let value = '' + this.props.items[i].value;
        if (contains(this.state.values, value)) {
          items.push(this.props.items[i]);
        }
      }
      return items;
    } else {
      return this.state.values;
    }
  },

  _formatLabel: function() {
    const items = this._getSelectedItems();
    if (items.length > 0) {
      const labelAttribute = this.props.labelAttribute || 'label';
      const labelTemplate = this.props.labelTemplate || (item => item[labelAttribute]);
      if (items.length === 1) {
        return labelTemplate(items[0]);
      } else {
        return (
          <ol>
            {
              items.map((item, i) => <li key={i}>{labelTemplate(item)}</li>)
            }
          </ol>
        );
      }
    } else {
      return this.props.unsetLabel || '';
    }
  },

  _handleSelectionChange: function(items) {
    if (!this.props.multiSelect && this.refs && this.refs.button) {
      this.refs.button.close();
    }
    if (this.props.treatValuesAsStrings) {
      let itemValues = compact(items.map(item => item.value));
      let newValues = this.props.multiSelect ? itemValues : (itemValues[0] || null);
      this.props.onChange(newValues);
    } else {
      this.props.onChange(this.props.multiSelect ? items : (items[0] || null));
    }
  }

});

module.exports = SelectListButton;
