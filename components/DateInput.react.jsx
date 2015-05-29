'use strict';

import React from 'react';
import moment from 'moment';
import 'moment-range';
import {describeTimeRange} from 't11e-utils/moment_utils';

import DropdownMenuButton from './DropdownMenuButton.react';
import CalendarSelector from './CalendarSelector.react';

const DateInput = React.createClass({

  propTypes: {
    unsetLabel: React.PropTypes.string.isRequired,
    dateRange: React.PropTypes.object,
    onChange: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      unsetLabel: '',
      dateRange: null,
      onChange: () => {}
    };
  },

  getInitialState() {
    return {
      dateRange: this.props.dateRange
    };
  },

  componentDidMount() {
  },

  componentDidUpdate(prevProps, prevState) {
    const {dateRange} = this.state;
    if (!(prevState.dateRange || moment.range()).isSame(dateRange || moment.range())) {
      this.props.onChange(dateRange);
    }
  },

  componentWillReceiveProps(nextProps) {
  },

  render() {
    return (
      <DropdownMenuButton
        label={this._formatLabel()}
        ref='button'
        isValueButton={true}>
        <CalendarSelector
          dateRange={this.state.dateRange}
          onChange={this._handleCalendarSelectorChange}/>
      </DropdownMenuButton>
    );
  },

  _handleCalendarSelectorChange(dateRange) {
    this.setState({dateRange: dateRange});
  },

  _formatLabel() {
    const {dateRange} = this.state;
    if (dateRange) {
      return describeTimeRange(dateRange);
    } else {
      return this.props.unsetLabel || '';
    }
  }

});

export default DateInput;
