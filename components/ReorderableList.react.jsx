'use strict';

import React from 'react';
import 'react/addons';
import $ from 'jquery';
import {pick, flatten, sortBy, extend, reduce, indexOf, find, isEqual} from 'underscore';
import {moveArrayElementByIndex, findIndex} from 't11e-utils/array_utils';
import {isPointInsideElement} from 't11e-utils/lib/DOMUtils';

import PreventSelectionMixin from '../lib/mixins/PreventSelectionMixin';
import LayeredComponentMixin from '../lib/mixins/LayeredComponentMixin';
import Floater from './Floater.react';

function isItemDraggable(item) {
  if (item.props.draggable !== undefined) {
    return item.props.draggable;
  } else {
    return true;
  }
}

const DragProxy = React.createClass({

  propTypes: {
    list: React.PropTypes.object,
    position: React.PropTypes.arrayOf(React.PropTypes.number),
    sequenceNumber: React.PropTypes.number,
    width: React.PropTypes.number,
    zIndex: React.PropTypes.number,
    item: React.PropTypes.element
  },

  getDefaultProps() {
    return {
      position: [0, 0]
    };
  },

  render() {
    const style = {
      position: 'absolute',
      left: this.props.position[0],
      top: this.props.position[1],
      width: this.props.width,
      zIndex: this.props.zIndex
    };
    const cellProps = pick(this.props, 'item', 'sequenceNumber', 'draggable', 'list');
    return (
      <div className='ReorderableList_Proxy' style={style}>
        <Cell {...cellProps}/>
      </div>
    );
  }

});

const Cell = React.createClass({

  mixins: [PreventSelectionMixin, LayeredComponentMixin],

  propTypes: {
    list: React.PropTypes.object,
    item: React.PropTypes.element,
    sequenceNumber: React.PropTypes.number,
    draggable: React.PropTypes.bool.isRequired,
    onDropped: React.PropTypes.func.isRequired,
    onDragging: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      onDragging() {},
      onDropped() {}
    };
  },

  getInitialState() {
    return {
      dragging: false
    };
  },

  componentDidMount() {
    $(document).on('mouseup touchend', this._handleDocumentMouseUp);
    $(document).on('touchmove', this._handleDocumentTouchMove);
    $(document).on('mousemove', this._handleDocumentMouseMove);
  },

  componentWillUnmount() {
    $(document).off('mouseup touchend', this._handleDocumentMouseUp);
    $(document).off('touchmove', this._handleDocumentTouchMove);
    $(document).off('mousemove', this._handleDocumentMouseMove);
  },

  render() {
    let draggable = this.props.draggable && isItemDraggable(this.props.item);
    return (
      <div className='ReorderableList_Cell'
        data-is-dragging={this.state.dragging}
        data-is-draggable={draggable}
        data-has-handle={this.props.draggable && this.props.list.props.showHandles}
        onMouseDown={draggable && this._handleMouseDown}
        onTouchStart={draggable && this._handleTouchStart}>
        {React.addons.cloneWithProps(this.props.item, {
          sequenceNumber: this.props.sequenceNumber
        })}
      </div>
    );
  },

  renderLayer(props) {
    const cellProps = pick(this.props, 'sequenceNumber', 'draggable', 'list', 'item');
    return this.state.dragging && (
      <Floater
        zIndex={props.zIndex}
        open={true}>
        <DragProxy
          zIndex={props.zIndex}
          position={this.state.dragPosition}
          width={$(this.getDOMNode()).outerWidth()}
          {... cellProps}/>
      </Floater>
    );
  },

  _handleTouchStart(event) {
    if (event.originalEvent) {
      event = event.originalEvent;
    }
    if (event.touches.length === 1) {
      event.preventDefault();
      let touch = event.touches.item(0);
      let offset = $(this.getDOMNode()).offset();
      let dragOffset = [touch.pageX - offset.left, touch.pageY - offset.top];
      this.setState({dragging: true, dragOffset});
      this._updateDragPosition(touch, dragOffset);
    }
  },

  _handleMouseDown(event) {
    event.preventDefault();
    let offset = $(this.getDOMNode()).offset();
    let dragOffset = [event.pageX - offset.left, event.pageY - offset.top];
    this.setState({dragging: true, dragOffset});
    this._updateDragPosition(event, dragOffset);
  },

  _handleDocumentMouseUp(event) {
    if (this.isMounted() && this.state.dragging) {
      this.setState({dragging: false});
      this.props.onDropped(this.props.item);
    }
  },

  _handleDocumentMouseMove(event) {
    if (this.state.dragging) {
      this._updateDragPosition(event, this.state.dragOffset);
    }
  },

  _handleDocumentTouchMove(event) {
    if (this.state.dragging) {
      if (event.originalEvent) {
        event = event.originalEvent;
      }
      if (event.touches.length === 1) {
        this._updateDragPosition(event.touches.item(0), this.state.dragOffset);
      }
      event.preventDefault();
    }
  },

  _updateDragPosition(event, dragOffset) {
    let dragPosition = [
      event.pageX - dragOffset[0],
      event.pageY - dragOffset[1]];
    this.setState({dragPosition: dragPosition});

    let mousePosition = [event.pageX, event.pageY];
    if (this.props.list.props.direction === 'vertical') {
      mousePosition[0] = $(this.getDOMNode()).offset().left + dragOffset[0];
    }
    this.props.onDragging(this.props.item, mousePosition);
  }

});

export const ReorderableItem = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    value: React.PropTypes.any
  },

  render() {
    return this.props.children;
  }

});

export const ReorderableList = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    onChanged: React.PropTypes.func.isRequired,
    showHandles: React.PropTypes.bool.isRequired,
    direction: React.PropTypes.oneOf(['vertical', 'horizontal']).isRequired
  },

  getDefaultProps() {
    return {
      showHandles: false,
      direction: 'vertical',
      onChanged() {}
    };
  },

  getInitialState() {
    return {
      keyOrder: this._getChildKeys(this.props.children)
    };
  },

  componentWillReceiveProps(nextProps) {
    let newKeyOrder = this._getChildKeys(nextProps.children);
    if (!isEqual(newKeyOrder, this.state.keyOrder)) {
      this.setState({keyOrder: newKeyOrder});
    }
  },

  render() {
    const childrenByKey = reduce(this._getChildren(this.props.children), (memo, child) => {
      return extend(memo, {[child.key]: child});
    }, {});
    return (
      <div className='ReorderableList' data-direction={this.props.direction}>
        <div className='ReorderableList_cells'>
          {
            this.state.keyOrder.map((key, keyIdx) => {
              const child = childrenByKey[key];
              return (
                <Cell key={`child-${key}`}
                  sequenceNumber={keyIdx}
                  item={child}
                  list={this}
                  draggable={this.state.keyOrder.length > 1}
                  onDropped={this._handleCellDropped}
                  onDragging={this._handleCellDragging}/>
              );
            })
          }
        </div>
      </div>
    );
  },

  _getChildren(children) {
    return flatten(children || []);
  },

  _getChildKeys(children) {
    return flatten(children || []).map(child => child.key);
  },

  _getOrderedChildren() {
    return sortBy(this._getChildren(this.props.children),
      child => this.state.keyOrder.indexOf(child.key));
  },

  _handleCellDropped(item) {
    const children = this._getOrderedChildren();
    this.props.onChanged(children, children.map(child => child.props.value));
  },

  _handleCellDragging(item, position) {
    const children = this._getChildren(this.props.children);
    const itemIndex = findIndex(children,
      child => child.key === item.key);
    const currentIndex = indexOf(this.state.keyOrder, item.key);
    if (~itemIndex && ~currentIndex) {
      const cellNodes = $(this.getDOMNode()).find('.ReorderableList_Cell');
      find(cellNodes, (element, idx) => {
        const $el = $(element);
        if (isPointInsideElement($el, position)) {
          if (this.state.keyOrder[idx] !== item.key) {
            const replacingItem = find(children, child => child.key === this.state.keyOrder[idx]);
            if (replacingItem && isItemDraggable(replacingItem)) {
              this.setState({
                keyOrder: moveArrayElementByIndex(this.state.keyOrder, currentIndex, idx)
              });
            }
          }
          return true;
        }
      });
    }
  }

});

export default ReorderableList;
