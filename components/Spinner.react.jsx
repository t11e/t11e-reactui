'use strict';

var React = require('react');

var Spinner = React.createClass({

  render: function() {
    return (
      <div className='Spinner'>
        <div className='Spinner_content'>
          <span/>
          {this.props.title ?
            <div className='Spinner_content_title'>
              {this.props.title}
            </div>
            :
            null}
        </div>
      </div>
    );
  }

});

module.exports = Spinner;
