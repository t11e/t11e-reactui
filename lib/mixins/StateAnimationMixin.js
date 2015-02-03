'use strict';

var Promise = require('bluebird');

var requestAnimationFrame = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.webkitCancelRequestAnimationFrame;

var Functions = {
  easeInOutSine: function(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  }
};

var Animator = function(fromValue, toValue, duration, easing, updateCallback, completionCallback) {
  this._fromValue = fromValue;
  this._toValue = toValue;
  this._duration = duration * 1000;
  this._updateCallback = updateCallback;
  this._completionCallback = completionCallback;
  this._startTime = null;
  this._easingFn = Functions[easing] || Functions.easeInOutSine;

  if (requestAnimationFrame && cancelAnimationFrame) {
    this._running = true;
    this._requestId = requestAnimationFrame(this._tick.bind(this));
  } else {
    this._updateCallback(toValue);
    this._completionCallback();
  }
};

Animator.prototype._tick = function(time) {
  if (this._running) {
    if (!this._startTime) {
      this._startTime = time;
    }
    if (time >= this._startTime + this._duration) {
      this.stop();
    } else {
      this._updateCallback(Math.round(
        this._easingFn(time - this._startTime,
          this._fromValue,
          this._toValue - this._fromValue,
          this._duration)));
      this._requestId = requestAnimationFrame(this._tick.bind(this));
    }
  } else {
    this._requestId = null;
  }
};

Animator.prototype.stop = function() {
  if (this._running) {
    this._running = false;
    this._updateCallback(this._toValue);
    this._completionCallback();
    if (this._requestId) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
  }
};

var StateAnimationMixin = {

  animateState: function(key, toValue, options) {
    if (isNaN(toValue)) {
      throw new Error("Invalid target value");
    }

    if (!this._animators) {
      this._animators = {};
    }

    var currentAnimator = this._animators[key];
    if (currentAnimator) {
      currentAnimator.stop();
      this._animators[key] = null;
    }

    var updateFn = function(newValue) {
      if (this.state[key] !== newValue) {
        var newState = {};
        newState[key] = newValue;
        this.setState(newState);
      }
    }.bind(this);

    var resolver = Promise.pending();

    this.setState({animating: true});
    var currentValue = this.state[key];
    var animator = new Animator(currentValue, toValue,
      options ? options.duration : 0.5,
      options ? options.easing : null, updateFn, function() {
        this.setState({animating: false});
        resolver.resolve();
      }.bind(this));
    this._animators[key] = animator;

    return resolver.promise;
  }

};

module.exports = StateAnimationMixin;
