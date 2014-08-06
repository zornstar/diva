var
    Promise = require('rsvp').Promise
  , Diva = function() { }

Diva {

  run: function(val) {
    var that = this;
    function chain(value) {
      var generator = that.__queue.shift();
      if(!that.__until || !that.__until(value)) {
        if(that.__queue.length === 0) {
          return generator(value);
        } else {
          return generator(value).then(function(result) { chain(result) });
        }
      }
    }
    chain(val);
    return this;
  },

  generate: function(promiseFunction) {
    this.__queue.push(promiseFunction);
    return this;
  },

  after: function(name, promisefunc) {
    for(var i = 0; i < this.__queue.length; ++i) {
      if(this.__queue[i].name === name) {
        this.__queue.splice(i+1, 0, promisefunc);
        ++i;
      }
    }
    return this;
  },

  before: function(name, promisefunc) {
    for(var i = 0; i < this.__queue.length; ++i) {
      if(this.queue[i].name === name) {
        this.queue.splice(i, 0, promisefunc);
        ++i;
      }
    }
    return this;
  },

  pause: function(delay) {
    var generator = function pause(result) {
      return new Promise(function (resolve, reject) {
        setTimeout(function() {
          resolve(result);
        }, delay)
      });
    }
    this.__queue.push(generator);
    return this;
  },

  display: function(value) {
    var generator = function display(result) {
      return new Promise(function (resolve, reject) {
        var display = value || result;
        console.log(display);
        resolve(result);
      });
    }
    this.__queue.push(generator);
    return this;
  },

  value: function(value) {
    var generator = function value(result) {
      return new Promise(function (resolve, reject) {
        resolve(value)
      });
    }
    this.__queue.push(generator);
    return this;
  },

  set: function(prop, value) {
    var that = this;
    var generator = function set(result) {
      return new Promise(function (resolve, reject) {
        that[prop] = value || result;
        resolve(that[prop]);
      });
    }
    this.__queue.push(generator);
    return this;
  },

  get: function(prop) {
    var that = this;
    var generator = function get(result) {
      return new Promise(function (resolve, reject) {
        resolve(that[prop] || null);
      });
    }
    this.__queue.push(generator);
    return this;
  }

  until = function(fn) {
    var that = this;
    var generator = function (result) {
      return new Promise(function (resolve, reject) {
        resolve(result);
      });
    }
    this.__until = fn;
    return this;
  },

  send: function(friend, value) {
    var generator = function send(result) {
      return new Promise(function (resolve, reject) {
        if(friend.onReceive) {
          friend.onReceive(value || result);
        }
        resolve(value || result);
      });
    }
    this.__queue.push(generator);
    return this;
  },

  mail: function(friend, value) {
    var generator = function mail(result) {
      return new Promise(function (resolve, reject) {

        friend.__mailbox.push(value || result);
        resolve(result);
      });
    }
    this.__queue.push(generator);
    return this;
  },

  retrieve: function(num) {
    var that = this;
    var generator = function retrieve(result) {
      return new Promise(function (resolve, reject) {
        if(that.__mailbox.length === 0) resolve(null);

        if(!num) {
          resolve(that.__mailbox.shift() || null)
        } else if (typeof num === 'number'){
          var ret = [ ], i = 0;
          while(i < num && that.__mailbox.length > 0) {
            ret.push(that.__mailbox.shift())
            ++i;
          }
          resolve(ret);
        } else {
          //throw error
        }
      });
    }
    this.__queue.push(generator);
    return this;
  },

  draw: function(num) {
    var that = this;
    var generator = function retrieve(result) {
      return new Promise(function (resolve, reject) {
        if(that.__mailbox.length === 0) resolve(null);

        if(!num) {
          resolve(that.__mailbox.push() || null)
        } else if (typeof num === 'number'){
          var ret = [ ], i = 0;
          while(i < num && that.__mailbox.length > 0) {
            ret.push(that.__mailbox.push())
            ++i;
          }
          resolve(ret);
        } else {
          //throw error
        }
      });
    }
    this.__queue.push(generator);
    return this;
  },


  onRecieve = function(fn) {
    this.onReceive = fn;
    return this;
  },

  module.exports = function(obj) {
    for(var p in Diva) { obj.prototype[p] = Diva[p]; }
    obj.prototype.__queue = [ ];
    obj.prototype.__mailbox = [ ];
  }
