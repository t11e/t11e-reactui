'use strict';

// TODO: Generalize and rename to something like Sortable

var React = require('react');
require('react/addons');
var $ = require('jquery');
var _ = require('underscore');

var PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');
var LayeredComponentMixin = require('../lib/mixins/LayeredComponentMixin');
var Floater = require('./Floater.react');

var classSet = React.addons.classSet;

var PriorityItem = function(label, name) {
  this.label = label;
  this.name = name;
};

var PriorityBarDragProxy = React.createClass({

  getDefaultProps: function() {
    return {
      position: [0, 0]
    };
  },

  remove: function() {
    var parentNode = this.getDOMNode().parentNode;
    if (parentNode) {
      React.unmountComponentAtNode(parentNode);
      $(parentNode).remove();
    }
  },

  render: function() {
    var style = {
      position: 'absolute',
      left: this.props.position[0],
      top: this.props.position[1],
      width: this.props.width,
      zIndex: this.props.zIndex
    };
    return (
      <div className='PriorityBar_cell_drag_proxy' style={style}>
        <span className='PriorityBar_cell_rank'>{this.props.rank}</span>
        <span className='PriorityBar_cell_label'>{this.props.item ? this.props.item.label : null}</span>
      </div>
    );
  }

});

var PriorityBarCell = React.createClass({

  mixins: [PreventSelectionMixin, LayeredComponentMixin],

  getInitialState: function() {
    return {
      dragging: false
    };
  },

  renderLayer: function(props) {
    return this.state.dragging && (
      <Floater
        zIndex={props.zIndex}
        open={true}>
        <PriorityBarDragProxy
          zIndex={props.zIndex}
          rank={this.props.rank}
          item={this.props.item}
          position={this.state.dragPosition}
          width={$(this.getDOMNode()).outerWidth()}/>
      </Floater>
    );
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.dragging !== this.state.dragging) {
      if (this.state.dragging) {
        $(document).on('mousemove', this._handleMouseMove);
        $(document).on('touchmove', this._handleTouchMove);
        $(document).on('mouseup touchend', this._handleMouseUp);
      } else {
        $(document).off('mouseup touchend', this._handleMouseUp);
        $(document).off('touchmove', this._handleTouchMove);
        $(document).off('mousemove', this._handleMouseMove);

        if (this.props.onRepositioned) {
          this.props.onRepositioned(this);
        }
      }
    }
  },

  componentWillUnmount: function() {
    $(document).off('mouseup touchend', this._handleMouseUp);
    $(document).off('touchmove', this._handleTouchMove);
    $(document).off('mousemove', this._handleMouseMove);
  },

  render: function() {
    return (
      <div className='PriorityBar_cell'
        data-name={this.props.item.name}
        data-dragging={this.state.dragging}
        onMouseDown={this._handleMouseDown}
        onTouchStart={this._handleTouchStart}>
        <span className='PriorityBar_cell_rank'>{this.props.rank}</span>
        <span className='PriorityBar_cell_label'>{this.props.item.label}</span>
      </div>
    );
  },

  _updateDragPosition: function(event, dragOffset) {
    var dragPosition = [event.pageX - dragOffset[0], event.pageY - dragOffset[1]];
    this.setState({dragPosition: dragPosition});

    if (this.props.onRepositioning) {
      this.props.onRepositioning(this, this.props.item, [event.pageX, event.pageY]);
    }
  },

  _handleTouchStart: function(event) {
    if (event.originalEvent) {
      event = event.originalEvent;
    }
    if (event.touches.length === 1) {
      event.preventDefault();
      var touch = event.touches.item(0);
      var offset = $(this.getDOMNode()).offset();
      var dragOffset = [touch.pageX - offset.left, touch.pageY - offset.top];
      this.setState({dragging: true, dragOffset: dragOffset});
      this._updateDragPosition(touch, dragOffset);
    }
  },

  _handleMouseDown: function(event) {
    event.preventDefault();

    var offset = $(this.getDOMNode()).offset();
    var dragOffset = [event.pageX - offset.left, event.pageY - offset.top];
    this.setState({dragging: true, dragOffset: dragOffset});
    this._updateDragPosition(event, dragOffset);
  },

  _handleMouseUp: function(/* event */) {
    this.setState({dragging: false});
  },

  _handleMouseMove: function(event) {
    this._updateDragPosition(event, this.state.dragOffset);
  },

  _handleTouchMove: function(event) {
    if (event.originalEvent) {
      event = event.originalEvent;
    }
    if (event.touches.length === 1) {
      this._updateDragPosition(event.touches.item(0), this.state.dragOffset);
    }
    event.preventDefault();
  }

});

var PriorityBar = React.createClass({

  getDefaultProps: function() {
    return {
      horizontal: false
    };
  },

  getInitialState: function() {
    return {
      order: _.map(this.props.items, function(item) { return item.name; })
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      order: _.map(nextProps.items, function(item) { return item.name; })
    });
  },

  render: function() {
    var self = this;
    return (
      <div className={classSet({
        'PriorityBar': true,
        'PriorityBar_horizontal': this.props.horizontal
      })}>
        <ul ref='ul'>
          {
            this._getItemsOrdered().map(function(item, index) {
              return (
                <li key={'child-' + item.name}>
                  <PriorityBarCell
                    item={item}
                    rank={index + 1}
                    onRepositioning={self._handleRepositioning}
                    onRepositioned={self._handleRepositioned}/>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  },

  _getItemsOrdered: function() {
    return _.compact(_.map(this.state.order, function(name) {
      return _.find(this.props.items, function(item) {
        return item.name === name;
      });
    }.bind(this)));
  },

  _handleRepositioned: function() {
    if (this.props.onOrderChanged) {
      this.props.onOrderChanged(this._getItemsOrdered());
    }
  },

  _handleRepositioning: function(cell, item, position) {
    var itemIndex;
    for (var i = 0; i < this.props.items.length; i++) {
      if (item.name === this.props.items[i].name) {
        itemIndex = i;
        break;
      }
    }
    if (itemIndex >= 0) {
      var currentIndex = this.state.order.indexOf(item.name);
      if (currentIndex !== -1) {
        _.find($(this.refs.ul.getDOMNode()).find('.PriorityBar_cell'), function(element, i) {
          var $el = $(element);
          if (this._isInsideCellElement($el, position)) {
            if (this.state.order[i] !== item.name) {
              var order = _.clone(this.state.order);
              this._moveArrayElement(order, currentIndex, i);
              this.setState({order: order});
            }
            return true;
          }
        }.bind(this));
      }
    }
  },

  _moveArrayElement: function(array, from, to) {
    if (to !== from) {
      var target = array[from];
      var increment = to < from ? -1 : 1;
      for (var k = from; k !== to; k += increment) {
        array[k] = array[k + increment];
      }
      array[to] = target;
    }
  },

  _isInsideCellElement: function($el, position) {
    var left = $el.offset().left;
    var top = $el.offset().top;
    var width = $el.outerWidth();
    var height = $el.outerHeight();
    return position[0] >= left && position[0] < left + width &&
      position[1] >= top && position[1] < top + height;
  }

});

var labels = {
  'square_footage': 'Sq.ft.',
  'bathrooms': 'Baths',
  'bedrooms': 'Beds',
  'has_photos': 'Photos'
};

var PriorityControls = React.createClass({

  propTypes: {
    order: React.PropTypes.array.isRequired,
    orderables: React.PropTypes.array.isRequired,
    horizontal: React.PropTypes.bool.isRequired
  },

  getDefaultProps: function() {
    return {
      horizontal: false
    };
  },

  getInitialState: function() {
    return {
      items: this._createItems()
    };
  },

  componentDidMount: function() {
    this._changed();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (!_.isEqual(prevProps.order, this.props.order) ||
      !_.isEqual(prevProps.orderables, this.props.orderables)) {
      this._changed();
    }
    /*
    if (this.props.onChange &&
      !_.isEqual(prevState.items, this.state.items)) {
      this.props.onChange(this.state.items);
    }
    */
  },

  render: function() {
    return (
      <div className='PriorityControls'>
        <PriorityBar
          items={this.state.items}
          horizontal={this.props.horizontal}
          onOrderChanged={this._handleOrderChanged}/>
      </div>
    );
  },

  _createItems: function() {
    var order = this.props.order;
    var orderables = this.props.orderables;
    return _.map(_.select(order, function(key) {
      return orderables.indexOf(key) !== -1;
    }.bind(this)), function(key) {
      return new PriorityItem(labels[key] || key, key);
    });
  },

  _changed: function() {
    this.setState({items: this._createItems()});
  },

  _handleOrderChanged: function(items) {
    this.setState({items: items});
    if (this.props.onChange) {
      this.props.onChange(_.map(items, function(item) { return item.name; }));
    }
  }

});

module.exports = PriorityControls;
