var Promise = require('rsvp').Promise;

var Diva = {

  run: function(val) {
    var q = this.__runningQueue || [ ];
    this.__runningQueue = q.concat(this.__queue);
    this.empty();

    if(this.__isRunning) return this;

    this.__isRunning = true;

    var that = this;

    function chain(value) {

      var generator = that.__runningQueue.shift();

      if(!that.__until || !that.__until(value)) {
        if(that.__runningQueue.length === 0) {
          that.__isRunning = false;
          return generator(value)
                  .catch(function(error) {
                    if(that.onError) {
                      that.onError(error);
                    }
                  });
        } else {
          return generator(value)
            .then(function(result) { chain(result) })
            .catch(function(error) {
              if(that.onError) {
                that.onError(error);
              }
            });
        }
      }
    }
    chain(val);
    return this;
  },
  stop: function() {
    this.__queue = this.__runningQueue.slice(0);
    this.__runningQueue = [ ];
    return this;
  },

  empty: function() {
    this.__queue = [ ];
    return this;
  },

  isRunning: function() {
    this.__isRunning = this.__isRunning || false;
    return this.__isRunning;
  },

  queue: function(fn) {
    if(!this.__queue) {
      this.__queue = [ ]
    }
    this.__queue.push(fn);
    return this;
  },
  after: function(name, fn) {
    for(var i = 0; i < this.__queue.length; ++i) {
      if(this.__queue[i].name === name) {
        this.__queue.splice(i+1, 0, fn);
        ++i;
      }
    }
    return this;
  },

  before: function(name, fn) {
    for(var i = 0; i < this.__queue.length; ++i) {
      if(this.queue[i].name === name) {
        this.queue.splice(i, 0, fn);
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
    return this.queue(generator);
  },

  display: function(value) {
    var generator = function display(result) {
      return new Promise(function (resolve, reject) {
        var display = value || result;
        console.log(display);
        resolve(result);
      });
    }
    return this.queue(generator);
  },

  value: function(value) {
    var generator = function value(result) {
      return new Promise(function (resolve, reject) {
        resolve(value)
      });
    }
    return this.queue(generator);
  },

  set: function(prop, value) {
    var that = this;
    var generator = function set(result) {
      return new Promise(function (resolve, reject) {
        that[prop] = value || result;
        resolve(that[prop]);
      });
    }
    return this.queue(generator);
  },

  get: function(prop) {
    var that = this;
    var generator = function get(result) {
      return new Promise(function (resolve, reject) {
        resolve(that[prop] || null);
      });
    }
    return this.queue(generator);
  },

  until: function(fn) {
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
    return this.queue(generator);
  },

  mail: function(friend, value) {
    if(friend) {
      var generator = function mail(result) {
        return new Promise(function (resolve, reject) {
          value = value || result
          friend.__addmail(value)
          resolve(value);
        });
      }
      this.queue(generator);
    }
    return this;
  },

  mailbox: function() {
    this.__mailbox = this.__mailbox || [ ];
    return this.__mailbox;
  },

  __addmail: function(mail) {
    this.mailbox().push(mail);
  },


  retrieve: function(num) {
    var that = this;
    var generator = function retrieve(result) {
      return new Promise(function (resolve, reject) {
        if(that.mailbox().length === 0) resolve(null);
        if(!num) {
          resolve(that.mailbox().shift() || null)
        } else if (typeof num === 'number'){
          var ret = [ ], i = 0;
          while(i < num && that.mailbox().length > 0) {
            ret.push(that.mailbox().shift())
            ++i;
          }
          resolve(ret);
        } else {
          //throw error
        }
      });
    }
    return this.queue(generator);
  },

  draw: function(num) {
    var that = this;
    var generator = function retrieve(result) {
      return new Promise(function (resolve, reject) {
        if(that.mailbox().length === 0) resolve(null);

        if(!num) {
          resolve(that.mailbox().push() || null)
        } else if (typeof num === 'number'){
          var ret = [ ], i = 0;
          while(i < num && that.mailbox.length > 0) {
            ret.push(that.mailbox().push())
            ++i;
          }
          resolve(ret);
        } else {
          //throw error
        }
      });
    }
    return this.queue(generator);
  },

  recieve: function(fn) {
    this.onReceive = fn;
    return this;
  },

  error: function(fn) {
    this.onError = fn;
    return this;
  }
}

module.exports = function(obj) {
  for(var p in Diva) { obj.prototype[p] = Diva[p]; }
}
