'use strict';

import React from 'react';

export const Field = React.createClass({

  propTypes: {
    label: React.PropTypes.string,
    children: React.PropTypes.node
  },

  render() {
    return (
      <div className='Field'>
        {
          this.props.label &&
            <label className='Field_label'>
              {this.props.label}
            </label>
        }
        <div className='Field_content'>
          {this.props.children}
        </div>
      </div>
    );
  }

});

export const Fieldset = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    direction: React.PropTypes.oneOf(['horizontal', 'vertical'])
  },

  getDefaultProps() {
    return {
      direction: 'vertical'
    };
  },

  render() {
    return (
      <div className='Fieldset' data-direction={this.props.direction}>
        {this.props.children}
      </div>
    );
  }

});

export const Form = React.createClass({

  propTypes: {
    children: React.PropTypes.node
  },

  render() {
    return (
      <div className='Form'>
        {this.props.children}
      </div>
    );
  }

});

export default Form;
