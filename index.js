var Promise = require('rsvp').Promise;

var diva = function() { }

diva.prototype.__queue = [ ];

diva.prototype.__until = null;

diva.prototype.run = function(val) {
  var that = this;

  function chain(value) {
    if(!that.__until || !that.__until(value)) {
      if(that.__queue.length === 1) {
        return that.__queue.shift()(value);
      } else that.__queue.shift()(value).then(function(result) { return chain(result) });
    }
  }
  chain(val);
  return this;
}

diva.prototype.generate = function(promiseFunction) {
  this.__queue.push(promiseFunction);
  return this;
}

diva.prototype.after = function(name, promisefunc) {
  var that = this;
//gen func returns a promise
  for(var i = 0; i < that.__queue.length; ++i) {
    if(that.__queue[i].name === name) {
      that.__queue.splice(i+1, 0, promisefunc);
      ++i;
    }
  }
  return this;
}

diva.prototype.before = function(name, promisefunc) {
  var that = this;
//gen func returns a promise
  for(var i = 0; i < that.__queue.length; ++i) {
    if(that.queue[i].name === name) {
      that.queue.splice(i, 0, promisefunc);
      ++i;
    }
  }
  return this;
}

diva.prototype.pause = function(delay) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      setTimeout(function() {
        resolve(result);
      }, delay)
    });
  }
  this.__queue.push(generator);
  return this;
}

diva.prototype.display = function(value) {
  var that = this;
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      var display = value || result;
      console.log(display);
      resolve(result);
    });
  }
  this.__queue.push(generator);
  return this;
}

diva.prototype.change = function(value) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      resolve(value)
    });
  }
  this.__queue.push(generator);
  return this;
}

diva.prototype.set = function(prop, value) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      that[prop] = value || result;
      resolve(that[prop]);
    });
  }
  this.__queue.push(generator);
  return this;
}

diva.prototype.get = function(prop) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      resolve(that[prop]);
    });
  }
  this.__queue.push(generator);
  return this;
}

diva.prototype.until = function(fn) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      resolve(result);
    });
  }
  this.__until = fn;
  return this;
}

diva.prototype.fork = function(friend) {
  var that = this;
//gen func returns a promise
  var generator = function (result) {
    return new Promise(function (resolve, reject) {
      friend.run(result);
      resolve(result);
    });
  }
  return this;
}

module.exports = function(Obj) {
  for(var p in diva.prototype) {
    Obj.prototype[p] = diva.prototype[p];
  } return Obj;
}
