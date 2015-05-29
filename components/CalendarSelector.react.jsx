'use strict';

import React from 'react';
import _ from 'underscore';
import moment from 'moment';
import 'moment-range';
import domEvent from 'dom-event';

function mapDateRangeBy(range, interval, mapper = null) {
  if (mapper === null) {
    mapper = d => d;
  }
  const dates = [];
  range.by(interval, d => dates.push(mapper(d)));
  return dates;
}

function extendRange(range, otherRange) {
  if (otherRange) {
    range = range.clone();
    if (range.start >= otherRange.start) {
      range.start = otherRange.start;
    } else if (range.end < otherRange.end) {
      range.end = otherRange.end;
    }
  }
  return range;
}

const CalendarSelector = React.createClass({

  propTypes: {
    dateRange: React.PropTypes.object,
    onChange: React.PropTypes.func,
    includeFuture: React.PropTypes.bool,
    showClearButton: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      showClearButton: true,
      includeFuture: true,
      dateRange: moment.range(),
      onChange: () => {}
    };
  },

  getInitialState() {
    let range = this.props.dateRange || moment.range();
    return {
      dateRange: range,
      focusedDate: range.end,
      selectingAnchor: null,
      selectingRange: null
    };
  },

  componentDidMount() {
    domEvent.on(document, 'mousemove', this._handleDocumentMouseMove);
    domEvent.on(document, 'mouseup', this._handleDocumentMouseUp);
  },

  componentWillUnmount() {
    domEvent.off(document, 'mouseup', this._handleDocumentMouseUp);
    domEvent.off(document, 'mousemove', this._handleDocumentMouseMove);
  },

  componentDidUpdate(prevProps, prevState) {
    const {dateRange} = this.state;
    if (!(prevState.dateRange || moment.range()).isSame(dateRange || moment.range())) {
      this.props.onChange(dateRange);
    }
  },

  render() {
    const {focusedDate} = this.state;

    const dayColumns = moment.weekdaysShort();
    const firstDayOfWeek = 0;
    const lastDayOfWeek = 6;
    const today = moment();
    const {includeFuture} = this.props;

    const displayRange = moment.range(
      moment(focusedDate).startOf('month').subtract(1, 'months'),
      moment(focusedDate).startOf('month'));
    const monthRanges = mapDateRangeBy(displayRange, 'month', d =>
      moment.range(
        moment(d).startOf('month'),
        moment(d).startOf('month').add(1, 'months')));

    let hints = {title: "Shift-click to extend selection"};
    return (
      <div className='CalendarSelector' {...hints}>
        <div className='CalendarSelector_main'>
          <span className='CalendarSelector_page_link CalendarSelector_previous_page_link'>
            <button onClick={this._handlePreviousPageLinkClick}><span>{'Previous'}</span></button>
          </span>
          <span className='CalendarSelector_pages'>
            {
              monthRanges.map((monthRange, pageIdx) => {
                const yearRange = moment.range(
                  moment(monthRange.start).startOf('year'),
                  moment(monthRange.start).startOf('year').add(1, 'years').subtract(1, 'days'));

                const filledOutRange = moment.range(
                  moment(monthRange.start).day(-firstDayOfWeek),
                  moment(monthRange.end).day(lastDayOfWeek));

                let visibleRange;
                if (pageIdx === 0) {
                  visibleRange = moment.range(filledOutRange.start, monthRange.end);
                } else if (pageIdx === monthRanges.length - 1) {
                  visibleRange = moment.range(monthRange.start, filledOutRange.end);
                } else {
                  visibleRange = monthRange;
                }

                const weeks = mapDateRangeBy(filledOutRange, 'weeks', d =>
                  moment.range(d, moment(d).day(lastDayOfWeek)));

                return (
                  <div className='CalendarSelector_page' key={pageIdx}
                    data-is-year-selected={this._selectionContainsDate(yearRange)}
                    data-is-month-selected={this._selectionContainsDate(monthRange)}>
                    <h4>
                      <span className='CalendarSelector_year'>
                        <a href='#'
                          onClick={this._handleYearHeadingClick.bind(this, yearRange)}
                          {...hints}>
                          {monthRange.start.format("YYYY")}
                        </a>
                      </span>
                      <span className='CalendarSelector_month'>
                        <a href='#'
                          onClick={this._handleMonthHeadingClick.bind(this, monthRange)}
                          {...hints}>
                          {monthRange.start.format("MMMM")}
                        </a>
                      </span>
                    </h4>
                    <table data-has-selection={this._haveSelection()}>
                      <thead>
                        <tr>
                          {
                            dayColumns.map((day, colIdx) => {
                              return (
                                <th key={colIdx}
                                  data-day-of-week={colIdx}>
                                  <span className='CalendarSelector_weekDayName'>
                                    {day}
                                  </span>
                                </th>
                              );
                            })
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {
                          weeks.map((week, weekIdx) => {
                            return (
                              <tr key={weekIdx}>
                                {
                                  mapDateRangeBy(week, 'day').map((day, dayIdx) => {
                                    let visible;
                                    if (day > today && !includeFuture) {
                                      visible = false;
                                    } else {
                                      visible = visibleRange.contains(day, true);
                                    }
                                    if (visible) {
                                      return (
                                        <td
                                          key={dayIdx}
                                          data-is-focused={day.isSame(focusedDate, 'day')}
                                          data-is-selected={this._selectionContainsDate(day)}
                                          data-is-today={day.isSame(today, 'day')}
                                          data-day-of-week={day.day()}
                                          onMouseDown={this._handleDayCellMouseDown.bind(this, day)}
                                          onMouseMove={this._handleDayCellMouseMove.bind(this, day)}
                                          {...hints}>
                                          <span className='CalendarSelector_day'>
                                            {day.date()}
                                          </span>
                                        </td>
                                      );
                                    } else {
                                      return (
                                        <td key={dayIdx} onClick={this._handleEmptyCellClick}>
                                          <span className='CalendarSelector_empty_cell'>{"\u00a0"}</span>
                                        </td>
                                      );
                                    }
                                  })
                                }
                              </tr>
                            );
                          })
                        }
                        {
                          _.range(6 - weeks.length).map(n => {
                            return (
                              <tr key={'n' + n}>
                                {
                                  _.range(7).map((m) => {
                                    return (
                                      <td key={m} onClick={this._handleEmptyCellClick}>
                                        <span className='CalendarSelector_empty_cell'>{"\u00a0"}</span>
                                      </td>
                                    );
                                  })
                                }
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                );
              })
            }
          </span>
          <span className='CalendarSelector_page_link CalendarSelector_next_page_link'>
            <button onClick={this._handleNextPageLinkClick}><span>{'Next'}</span></button>
          </span>
        </div>
        {
          this.props.showClearButton && this.state.dateRange &&
            <div className='CalendarSelector_clear'>
              <button onClick={this._handleClearButtonClick}>Clear</button>
            </div>
        }
      </div>
    );
  },

  _haveSelection() {
    return !!(this.state.selectingRange || this.state.dateRange);
  },

  _selectionContainsDate(dateOrRange) {
    let selectionRange = this.state.selectingRange || this.state.dateRange;
    if (selectionRange) {
      return selectionRange.isSame(dateOrRange) ||
        selectionRange.contains(dateOrRange, true);
    } else {
      return false;
    }
  },

  _toggleRange(range, extend = false) {
    const {dateRange} = this.state;
    if (extend) {
      range = extendRange(range, dateRange);
    } else if (dateRange && range.isSame(dateRange)) {
      range = null;
    }
    this.setState({dateRange: range});
  },

  _handleYearHeadingClick(range, event) {
    event.preventDefault();
    this._toggleRange(range, event.shiftKey);
  },

  _handleMonthHeadingClick(range, event) {
    event.preventDefault();
    this._toggleRange(range, event.shiftKey);
  },

  _handlePreviousPageLinkClick(event) {
    event.preventDefault();
    this.setState({
      focusedDate: moment(this.state.focusedDate).subtract(1, 'month')
    });
  },

  _handleNextPageLinkClick(event) {
    event.preventDefault();
    this.setState({
      focusedDate: moment(this.state.focusedDate).add(1, 'month')
    });
  },

  _clearSelection() {
    this.setState({dateRange: null});
  },

  _handleEmptyCellClick(event) {
    event.preventDefault();
    this._clearSelection();
  },

  _handleClearButtonClick(event) {
    event.preventDefault();
    this._clearSelection();
  },

  _handleDayCellMouseDown(day, event) {
    event.preventDefault();
    let range = moment.range(day, moment(day).add(1, 'day'));
    if (event.shiftKey) {
      range = extendRange(range, this.state.dateRange);
    }
    this.setState({
      selecting: true,
      selectingRange: range,
      selectingAnchor: day
    });
  },

  _handleDayCellMouseMove(day, event) {
    if (this.state.selecting) {
      const {selectingAnchor} = this.state;
      if (!day.isSame(selectingAnchor, 'day')) {
        let newRange;
        if (day < selectingAnchor) {
          newRange = moment.range(day, moment(selectingAnchor).add(1, 'day'));
        } else if (day > selectingAnchor) {
          newRange = moment.range(selectingAnchor, moment(day).add(1, 'day'));
        }
        if (newRange) {
          this.setState({
            selectingRange: newRange
          });
        }
      }
    }
  },

  _handleDocumentMouseMove(event) {
  },

  _handleDocumentMouseUp(event) {
    const {selectingRange} = this.state;
    this.setState({selecting: false});
    if (selectingRange) {
      this.setState({
        selectingRange: null,
        dateRange: selectingRange
      });
    }
  }

});

export default CalendarSelector;
