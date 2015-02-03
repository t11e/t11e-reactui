'use strict';

var React = require('react');
var $ = require('jquery');
var _ = require('underscore');

var PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');

var SelectList = React.createClass({

  mixins: [PreventSelectionMixin],

  getDefaultProps: function() {
    return {
      limit: null,
      multiSelect: false,
      template: function(item) { return item.label; },
      parentInput: null,
      parentElement: null,
      selectedItems: [],
      onSelectionChange: null
    };
  },

  getInitialState: function() {
    return {
      selectedItems: this.props.selectedItems,
      currentItem: null
    };
  },

  componentDidMount: function() {
    if (this.props.parentInput) {
      $(this.props.parentInput).on('keydown', this._handleParentInputKeydown);
    }
  },

  componentWillUnmount: function() {
    if (this.props.parentInput) {
      $(this.props.parentInput).off('keydown', this._handleParentInputKeydown);
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
  },

  render: function() {
    var self = this;
    var items = this.props.items;

    var limited = false;
    if (this.props.limit && items.length > this.props.limit) {
      items = items.slice(0, this.props.limit);
      limited = true;
    }

    return (
      <div className='SelectList'
        data-multi-select={this.props.multiSelect}
        onClick={this._handleItemClick}>
        <ul>
          {
            items.map(function(item, i) {
              return (
                <li key={'item-' + i}
                  data-item-index={i}
                  data-current={self.state.currentItem === item}
                  data-selected={self._isItemSelected(item)}>
                  {self.props.template(item)}
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  },

  _handleItemClick: function(event) {
    if (!this.isMounted()) {
      return;
    }
    var $target = $(event.target);
    if (!$target.is('li')) {
      $target = $($target.parents('[data-item-index]').get(0));
    }
    if ($target.attr('data-item-index')) {
      var index = parseInt($target.attr('data-item-index'));
      if (index >= 0 && index < this.props.items.length) {
        if (this.props.multiSelect) {
          this._toggleSelectItem(this.props.items[index]);
        } else {
          this._selectItem(this.props.items[index]);
        }
        event.preventDefault();
              }
    }
  },

  _setSelection: function(items) {
    if (!_.isEqual(this.state.selectedItems, items)) {
      this.setState({selectedItems: items});
      if (this.props.onSelectionChange) {
        this.props.onSelectionChange(items);
      }
    }
  },

  _isItemSelected: function(item) {
    return _.any(this.state.selectedItems, function(i) {
      return _.isEqual(i, item);
    });
  },

  _selectItem: function(item) {
    if (item) {
      if (this.props.multiSelect) {
        if (item.value === null) {
          this._setSelection([]);
        } else if (!this._isItemSelected(item)) {
          this._setSelection(this.state.selectedItems.concat([item]));
        }
      } else {
        this._setSelection([item]);
      }
    }
  },

  _unselectItem: function(item) {
    this._setSelection(_.reject(this.state.selectedItems, function(i) {
      return _.isEqual(i, item);
    }));
  },

  _toggleSelectItem: function(item) {
    if (item) {
      if (this._isItemSelected(item)) {
        this._unselectItem(item);
      } else {
        this._selectItem(item);
      }
    }
  },

  _handleParentInputKeydown: function(event) {
    var items = this.props.items;
    switch (event.keyCode) {
      case 38:
        var index = 0;
        if (this.state.currentItem) {
          index = items.indexOf(this.state.currentItem);
          if (index == 0) {
            index = items.length - 1;
          } else {
            index--;
          }
        } else if (items.length > 0) {
          index = items.length - 1;
        }
        this.setState({currentItem: items[index]});
        event.preventDefault();

      case 40:
        var index = 0;
        if (this.state.currentItem) {
          index = items.indexOf(this.state.currentItem);
          if (index >= items.length - 1) {
            index = 0;
          } else {
            index++;
          }
        } else if (items.length > 0) {
          index = 0;
        }
        this.setState({currentItem: items[index]});
        event.preventDefault();

      case 13:
        this._selectItem(this.state.currentItem);
        event.preventDefault();
    }
  }

});

module.exports = SelectList;
