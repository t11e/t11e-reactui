'use strict';

var React = require('react');
var _ = require('underscore');

var DropdownMenuButton = require('./DropdownMenuButton.react');
var SelectList = require('./SelectList.react');

var SelectListButton = React.createClass({

  getDefaultProps: function() {
    return {
      items: [],
      unsetLabel: '',
      labelAttribute: 'label',
      multiSelect: false,
      itemTemplate: function(item) {
        return (
          <a>
            <span>{item[this.labelAttribute || 'label']}</span>
            <span className='count'>{item.count != 0 ? item.count : ''}</span>
          </a>
        );
      }.bind(this)
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
          multiSelect={this.props.multiSelect}
          selectedItems={this._getSelectedItems()}
          onSelectionChange={this._handleSelectionChange}
          template={this.props.itemTemplate}/>
      </DropdownMenuButton>
    );
  },

  _updateValues: function(values) {
    values || (values = []);

    // TODO: We translate somewhat awkwardly between "raw" values from the
    //   props and the actual cooked item used by the select list. This
    //   entails converting them to strings. We should always use clean,
    //   cooked items.
    if (!_.isArray(values)) {
      values = [values];
    }
    values = _.map(_.compact(values),
      function(v) { return '' + v; });
    this.setState({values: values});
  },

  _getSelectedItems: function() {
    var items = [];
    for (var i = 0; i < this.props.items.length; i++) {
      if (this._isValueSelected(this.props.items[i].value)) {
        items.push(this.props.items[i]);
      }
    }
    return items;
  },

  _isValueSelected: function(value) {
    return _.contains(this.state.values, '' + value);
  },

  _formatLabel: function() {
    var self = this;
    var items = this._getSelectedItems();
    if (items.length > 0) {
      return _.map(items, function(item) {
        return item[self.props.labelAttribute || 'label'] || '';
      }).join(', ');
    } else {
      return this.props.unsetLabel || '';
    }
  },

  _handleSelectionChange: function(items) {
    if (this.props.onChange) {
      if (!this.props.multiSelect && this.refs && this.refs.button) {
        this.refs.button.close();
      }
      var itemValues = _.compact(
        _.map(items, function(item) {
          return item.value;
        }));

      var newValues = this.props.multiSelect ? itemValues : (itemValues[0] || null);
      this.props.onChange(newValues);
    }
  }

});

module.exports = SelectListButton;
