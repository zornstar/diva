var request = require('request')
  , diva    = require('../index')
  , Promise = require('rsvp').Promise
  , fs      = require('fs')

var Person = function() {
  this.name = "John Smith"
  this.gender = "male"
  this.strength = 100;
}

Person = diva(Person);

Person.prototype.lift = function(weight) {
  var that = this;
  return that.generate(function lift(result) {
    return new Promise(function (resolve, reject) {
      that.strength+=100
      console.log('Strength: ' + that.strength);
      resolve(that.strength);
    });
  });
}

Person.prototype.google = function(query) {
  var that = this;
  return that.generate(function google(result) {
    return new Promise(function (resolve, reject) {
      query = query || result;
      console.log(query);
      var url = "https://www.google.com/#q=" + query;
      console.log('Making request to ' + url);
      request(url, function (err, response, body) {
        if(err) reject(err);
        console.log('Success!')
        resolve(body);
      });
    });
  });
}

Person.prototype.save = function(fileName) {
  var that = this;
  return that.generate(function save(result) {
    return new Promise(function (resolve, reject) {
      fs.writeFile(fileName, result, function(err) {
        if(err) reject(err);
        resolve(fileName);
      });
    });
  });
}

Person.prototype.changeName = function(name) {
  var that = this;
  return that.generate(function changeName(result) {
    return new Promise(function (resolve, reject) {
        that.name = name;
        console.log('I changed my name to ' + name);
        resolve(name);
    });
  });
}

/***********/
var john = new Person();
console.log(__dirname);

john
  .display()
  .lift()
  .set('first lift')
  .google()
  .display('10 second pause')
  .pause(10000)
  .lift()
  .display()
  .google('john')
  .save(__dirname + '/test.txt')
  .display()
  .changeName('Mary')
  .after('lift', function(result) {
    return new Promise(function (resolve, reject) {
      console.log('Wow!!!' + ' ' + result)
      console.log('That was exausting!')
      resolve(result);
    });
  })
  .get('first lift')
  .display()
  .run('from the top!')
