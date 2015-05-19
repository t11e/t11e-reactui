'use strict';

let React = require('react');
let $ = require('jquery');
import {isEqual, zip, every, any, reject} from 'underscore';
import Immutable from 'immutable';

let PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');

/**
 * Note that items should either be primitives (eg., strings) or implement `equals()`;
 * otherwise they are compared structurally using Underscore's `isEqual()`.
 */
let SelectList = React.createClass({

  mixins: [PreventSelectionMixin],

  propTypes: {
    items: React.PropTypes.array.isRequired,
    limit: React.PropTypes.number,
    multiSelect: React.PropTypes.bool,
    template: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.element
    ]),
    groupBy: React.PropTypes.func,
    groupTemplate: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.element
    ]),
    parentInput: React.PropTypes.object,
    parentElement: React.PropTypes.object,
    selectedItems: React.PropTypes.array,
    onSelectionChange: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      limit: null,
      multiSelect: false,
      template: item => item.label,
      groupBy: () => null,
      parentInput: null,
      parentElement: null,
      selectedItems: [],
      onSelectionChange: () => {}
    };
  },

  getInitialState() {
    return {
      selectedItems: this.props.selectedItems,
      currentItem: null
    };
  },

  componentDidMount() {
    if (this.props.parentInput) {
      $(this.props.parentInput).on('keydown', this._handleParentInputKeydown);
    }
  },

  componentWillUnmount() {
    if (this.props.parentInput) {
      $(this.props.parentInput).off('keydown', this._handleParentInputKeydown);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!this._itemArraysEqual(this.state.selectedItems, nextProps.selectedItems)) {
      this.setState({selectedItems: nextProps.selectedItems});
    }
  },

  render() {
    let items = Immutable.List(this.props.items);
    if (this.props.limit && items.size > this.props.limit) {
      items = items.slice(0, this.props.limit);
    }

    const groups = items.map((item, idx) => [item, idx]).groupBy(
      ([item, ]) => this.props.groupBy(item)).entrySeq();

    return (
      <div className='SelectList'
        data-multi-select={this.props.multiSelect}
        onClick={this._handleItemClick}>
        {
          groups.map(([group, groupItems], groupIdx) => {
            const ol = (
              <ol key={groupIdx}>
                {
                  groupItems.map(([item, idx]) => {
                    return (
                      <li key={idx}
                        data-item-index={idx}
                        data-current={this._itemsEqual(this.state.currentItem, item)}
                        data-selected={this._isItemSelected(item)}>
                        {this.props.template(item)}
                      </li>
                    );
                  }).toArray()
                }
              </ol>
            );
            if (group) {
              return (
                <div className='SelectList_group' key={groupIdx}>
                  <div className='SelectList_group_heading'>
                    {this.props.groupTemplate(group)}
                  </div>
                  {ol}
                </div>
              );
            } else {
              return ol;
            }
          }).toArray()
        }
      </div>
    );
  },

  _handleItemClick(event) {
    if (!this.isMounted()) {
      return;
    }
    let $target = $(event.target);
    if (!$target.is('li')) {
      $target = $($target.parents('[data-item-index]').get(0));
    }
    if ($target.attr('data-item-index')) {
      let index = parseInt($target.attr('data-item-index'));
      if (index >= 0 && index < this.props.items.length) {
        if (this.props.multiSelect) {
          this._toggleSelectItem(this.props.items[index], true);
        } else {
          this._selectItem(this.props.items[index], true);
        }
        event.preventDefault();
      }
    }
  },

  _setSelection(items, click = false) {
    if (!this._itemArraysEqual(this.state.selectedItems, items)) {
      this.setState({selectedItems: items});
      this.props.onSelectionChange(items, click);
    }
  },

  _itemArraysEqual(a, b) {
    if (a.length === b.length) {
      return every(zip(a, b), ([aa, bb]) => this._itemsEqual(aa, bb));
    }
    return false;
  },

  _itemsEqual(a, b) {
    if (a === null || a === undefined) {
      return b === null || b === undefined;
    } else if (a === b) {
      return true;
    } else if (typeof a.equals === 'function' && typeof b.equals === 'function') {
      return a.equals(b);
    } else {
      return isEqual(a, b);
    }
  },

  _isItemSelected(item) {
    return any(this.state.selectedItems, other => this._itemsEqual(item, other));
  },

  _selectItem(item, click = false) {
    if (item) {
      if (this.props.multiSelect) {
        if (item.value === null) {
          this._setSelection([], click);
        } else if (!this._isItemSelected(item)) {
          this._setSelection(this.state.selectedItems.concat([item]), click);
        }
      } else {
        this._setSelection([item], click);
      }
    }
  },

  _unselectItem(item) {
    this._setSelection(
      reject(this.state.selectedItems, other => this._itemsEqual(item, other)));
  },

  _toggleSelectItem(item) {
    if (item) {
      if (this._isItemSelected(item)) {
        this._unselectItem(item);
      } else {
        this._selectItem(item);
      }
    }
  },

  _handleParentInputKeydown(event) {
    switch (event.keyCode) {
      case 38:
        this._selectPreviousItem();
        event.preventDefault();
        break;

      case 40:
        this._selectNextItem();
        event.preventDefault();
        break;

      case 13:
        this._selectCurrentItem();
        event.preventDefault();
        break;
    }
  },

  _selectCurrentItem() {
    this._selectItem(this.state.currentItem);
  },

  _selectPreviousItem() {
    let items = this.props.items;
    let index = 0;
    if (this.state.currentItem) {
      index = items.indexOf(this.state.currentItem);
      if (index === 0) {
        index = items.length - 1;
      } else {
        index--;
      }
    } else if (items.length > 0) {
      index = items.length - 1;
    }
    this.setState({currentItem: items[index]});
  },

  _selectNextItem() {
    let items = this.props.items;
    let index = 0;
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
  }

});

module.exports = SelectList;
