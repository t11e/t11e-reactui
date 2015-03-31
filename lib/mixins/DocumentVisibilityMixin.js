var DocumentVisibilityMixin = {

  getInitialState: function() {
    var hidden, visibilityChange; 
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support 
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    return {
      documentHidden: hidden,
      visibilityChange: visibilityChange,
      interval: null
    };

  },

  componentDidMount: function() {
    document.addEventListener(this.state.visibilityChange, this._handleVisibilityChange);
  },

  componentWillUnmount: function() {
    document.removeListener(this.state.visibilityChange, this._handleVisibilityChange);
  },

  scheduleFunction: function(fn, ms) {
    this.setState({
      fn: fn,
      ms: ms,
      interval: setInterval(fn, ms)
    });
  },

  _handleVisibilityChange: function() {
    if (document[this.state.documentHidden] && this.state.interval) {
      this.setState({interval: clearInterval(this.state.interval)});
    } else if (this.state.fn && this.state.ms) {
      this.setState({interval: setInterval(this.state.fn, this.state.ms)});
    }
  }

};

module.exports = DocumentVisibilityMixin;
