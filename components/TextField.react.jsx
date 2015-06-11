'use strict';

import React from 'react';
import {getWidth} from 't11e-utils/lib/DOMUtils';

import BalloonMixin from '../lib/mixins/BalloonMixin.react';

function findBlockLevelParent(element) {
  const parent = element.parentElement;
  if (parent) {
    switch (parent.tagName) {
      case 'ADDRESS':
      case 'BLOCKQUOTE':
      case 'DIV':
      case 'DL':
      case 'FIELDSET':
      case 'FORM':
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
      case 'HR':
      case 'NOSCRIPT':
      case 'OL':
      case 'P':
      case 'PRE':
      case 'TABLE':
      case 'UL':
      case 'DD':
      case 'DT':
      case 'LI':
      case 'TBODY':
      case 'TD':
      case 'TFOOT':
      case 'TH':
      case 'THEAD':
      case 'TR':
        return parent;

      default:
        if (parent === document.documentElement || parent === document.body) {
          return parent;
        } else {
          return findBlockLevelParent(parent);
        }
    }
  } else {
    return document.documentElement || document.body;
  }
}

const TextField = React.createClass({

  mixins: [BalloonMixin],

  propTypes: {
    placeholder: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf([
      'string',
      'text',
      'integer'
    ]),
    validator: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onChange: React.PropTypes.func,
    inline: React.PropTypes.bool,
    delayed: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      placeholder: '',
      type: 'string',
      inline: false,
      delayed: false
    };
  },

  getInitialState() {
    return {
      value: this.props.value,
      width: null
    };
  },

  componentDidMount() {
    this._updateTemplate();
  },

  componentWillReceiveProps(nextProps) {
    const {value} = nextProps;
    if (value !== this.state.value) {
      this.setState({value});
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      const {validator} = this.props;
      if (validator) {
        const validationResult = validator(this.state.value);
        if (validationResult) {
          this.showBalloon(<span>{validationResult}</span>, {placement: 'below'});
        } else {
          this.hideBalloon();
        }
      }
      this._scheduleChangeHandler();
    }
  },

  render() {
    const {value} = this.state;

    const commonProps = {
      ref: 'input',
      onKeyPress: this._handleInputKeyPress,
      onKeyUp: this._handleInputChange,
      onBlur: this._handleInputBlur,
      onChange: this._handleInputChange,
      onFocus: this._updateTemplate
    };

    let content;
    switch (this.props.type) {
      case 'text':
        content = (
          <textarea
            ref='input'
            rows='5'
            placeholder={this.props.placeholder}
            {...commonProps}>
            {value}
          </textarea>
        );
        break;

      case 'string':
      case 'integer':
        content = (
          <input
            ref='input'
            type='text'
            style={{width: this.state.width}}
            value={value || ''}
            placeholder={this.props.placeholder}
            {...commonProps}/>
        );
        break;

      default:
        content = null;
    }

    return (
      <span className='TextField'
        data-type={this.props.type}
        data-inline={this.props.inline}>
        {content}
        {
          this.props.inline &&
            <span className='TextField_template' ref='template'>
              {value}
            </span>
        }
      </span>
    );
  },

  focus() {
    setTimeout(() => {
      if (this.refs.input) {
        const node = this.refs.input.getDOMNode();
        if (node) {
          this.refs.input.getDOMNode().focus();
        }
      }
    }, 0);
  },

  getValue() {
    return this.state.value;
  },

  _handleInputBlur() {
    if (this.props.inline) {
      this._submit();
    }
  },

  _handleInputChange() {
    if (this.isMounted() && this.refs) {
      let value = this.refs.input.getDOMNode().value;
      if (value !== this.state.value) {
        this.setState({value});
        this._updateTemplate(value);
      }
    }
  },

  _scheduleChangeHandler() {
    if (this.props.onChange) {
      let handler = () => {
        if (this.isMounted() && this.refs && this.props.onChange) {
          this.props.onChange(this.refs.input.getDOMNode().value);
        }
      };
      if (this.props.delayed) {
        if (this._updateTimeoutId) {
          window.clearTimeout(this._updateTimeoutId);
        }
        this._updateTimeoutId = window.setTimeout(handler, 250);
      } else {
        handler();
      }
    }
  },

  _handleInputKeyPress(event) {
    if (event.which === 13) {
      this._submit();
    }

    let {onKeyPress} = this.props;
    if (onKeyPress) {
      onKeyPress(event);
    }
  },

  _updateTemplate(value = null) {
    if (this.refs.template) {
      this.refs.template.getDOMNode().value = value || this.state.value;
      setTimeout(this._updateWidth, 0);
    }
  },

  _updateWidth() {
    if (this.refs.template) {
      const domNode = this.refs.template.getDOMNode();
      if (domNode) {
        const width = Math.min(
          getWidth(findBlockLevelParent(domNode)),
          getWidth(domNode));
        this.setState({width});
      }
    }
  },

  _submit() {
    let {onSubmit} = this.props;
    if (onSubmit) {
      onSubmit(this.state.value);
    }
  }

});

export default TextField;
