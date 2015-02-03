'use strict';

var React = require('react');
var _ = require('underscore');
var $ = require('jquery');

var PreventSelectionMixin = require('../lib/mixins/PreventSelectionMixin');

var ToggleSliderItem = React.createClass({
  render: function() {
    return this.props.children;
  }
});

var ToggleSlider = React.createClass({

  mixins: [PreventSelectionMixin],

  getDefaultProps: function() {
    return {
      onChange: null,
      items: [],
      value: null
    };
  },

  getInitialState: function() {
    return {
      selectedValue: this.props.value,
      handleX: null,
      handleWidth: null
    }
  },

  componentDidMount: function() {
    this._updateHandle();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.value !== this.props.value ||
      prevProps.values !== this.props.values ||
      this.state.selectedValue !== prevState.selectedValue) {
      this._updateHandle();
    }

    if (prevProps.value !== this.props.value) {
      this.setState({selectedValue: this.props.value});
    }

    if (this.props.onChange && prevState.selectedValue !== this.state.selectedValue) {
      this.props.onChange(this.state.selectedValue);
    }
  },

  render: function() {
    var items = this.props.children ? _.flatten([this.props.children]) : [];
    if (items.length === 0) {
      return null;
    }

    var handleStyle = {};
    if (this.state.handleX !== null && this.state.handleWidth !== null) {
      handleStyle.left = this.state.handleX;
      handleStyle.width = this.state.handleWidth;
    }

    return (
      <div className='ToggleSlider'
        data-value={this.state.selectedValue || 'null'}
        onClick={this._handleClick}>
        {
          _.map(items, function(item, idx) {
            return <span
              className='ToggleSlider_item'
              data-value={item.props.value || 'null'}
              key={idx}>
              {item}
            </span>
          })
        }
        {
          handleStyle &&
            <span className='ToggleSlider_handle' style={handleStyle}/>
        }
      </div>
    )
  },

  _handleClick: function(event) {
    this.setState({
      selectedValue: $(event.target).closest('.ToggleSlider_item').attr('data-value')
    });
    event.preventDefault();
  },

  _updateHandle: function() {
    var $el = $(this.getDOMNode());
    var $item = $el.find('.ToggleSlider_item[data-value="' +
      (this.state.selectedValue || 'null') + '"]');
    if ($item.length > 0) {
      this.setState({
        handleX: $item.offset().left - $el.offset().left,
        handleWidth: $item.outerWidth()
      });
    }
  }

});

module.exports = {
  ToggleSlider: ToggleSlider,
  ToggleSliderItem: ToggleSliderItem
};
