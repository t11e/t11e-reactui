'use strict';

import React, {PropTypes} from 'react';

import PreventSelectionMixin from '../lib/mixins/PreventSelectionMixin';

const Checkbox = React.createClass({

  mixins: [PreventSelectionMixin],

  propTypes: {
    checked: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      checked: false,
      onChange: () => null
    };
  },

  getInitialState() {
    return {
      checked: this.props.checked
    };
  },

  componentWillReceiveProps(nextProps) {
    const {checked} = nextProps;
    if (checked !== this.state.checked) {
      this.setState({checked});
    }
  },

  componentDidUpdate(prevProps, prevState) {
    const {checked} = this.state;
    if (prevState.checked !== checked) {
      this.props.onChange(checked);
    }
  },

  render() {
    return (
      <div className='Checkbox'
        data-checked={this.state.checked}
        onClick={this._handleClick}>
        <span className='Checkbox_value'/>
        {
          this.props.label &&
            <label>{this.props.label}</label>
        }
      </div>
    );
  },

  _handleClick(event) {
    event.preventDefault();
    this.setState({checked: !this.state.checked});
  }

});

export default Checkbox;
