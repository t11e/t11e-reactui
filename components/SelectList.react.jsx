'use strict';

let React = require('react');
let $ = require('jquery');
let _ = require('underscore');
import Immutable from 'immutable';

let PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');

let SelectList = React.createClass({

  mixins: [PreventSelectionMixin],

  propTypes: {
    items: React.PropTypes.array.isRequired,
    limit: React.PropTypes.number,
    multiSelect: React.PropTypes.bool,
    template: React.PropTypes.func,
    groupBy: React.PropTypes.func,
    groupTemplate: React.PropTypes.func,
    parentInput: React.PropTypes.object,
    parentElement: React.PropTypes.object,
    selectedItems: React.PropTypes.array,
    onSelectionChange: React.PropTypes.func
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
      onSelectionChange: null
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
                        data-current={this.state.currentItem === item}
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
          this._toggleSelectItem(this.props.items[index]);
        } else {
          this._selectItem(this.props.items[index]);
        }
        event.preventDefault();
      }
    }
  },

  _setSelection(items) {
    if (!_.isEqual(this.state.selectedItems, items)) {
      this.setState({selectedItems: items});
      if (this.props.onSelectionChange) {
        this.props.onSelectionChange(items);
      }
    }
  },

  _isItemSelected(item) {
    return _.any(this.state.selectedItems, function(i) {
      return _.isEqual(i, item);
    });
  },

  _selectItem(item) {
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

  _unselectItem(item) {
    this._setSelection(_.reject(this.state.selectedItems, function(i) {
      return _.isEqual(i, item);
    }));
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
