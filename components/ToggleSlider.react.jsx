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

  propTypes: {
    onChange: React.PropTypes.func,
    items: React.PropTypes.array,
    value: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      onChange: null,
      items: [],
      value: null
    };
  },

  getInitialState: function() {
    return {
      selectedValue: this.props.value
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
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

    if (this.isMounted()) {
      var $el = $(this.getDOMNode());
      var $item = $el.find('.ToggleSlider_item[data-value="' +
        (this.state.selectedValue || 'null') + '"]');
      var handleX = $item.offset().left - $el.offset().left;
      var handleWidth = $item.outerWidth();
    }

    var handleStyle = {};
    if (handleX !== null && handleWidth !== null) {
      handleStyle.left = handleX;
      handleStyle.width = handleWidth;
    }

    return (
      <div className='ToggleSlider'
        data-value={this.state.selectedValue || 'null'}
        onClick={this._handleClick}>
        {
          _.map(items, function(item, idx) {
            return (
              <span
                className='ToggleSlider_item'
                data-value={item.props.value || 'null'}
                key={idx}>
                {item}
              </span>
            );
          })
        }
        {
          handleStyle &&
            <span className='ToggleSlider_handle' style={handleStyle}/>
        }
      </div>
    );
  },

  _handleClick: function(event) {
    this.setState({
      selectedValue: $(event.target).closest('.ToggleSlider_item').attr('data-value')
    });
    event.preventDefault();
  }

});

module.exports = {
  ToggleSlider: ToggleSlider,
  ToggleSliderItem: ToggleSliderItem
};
