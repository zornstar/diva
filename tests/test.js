var request = require('request')
  , diva    = require('../index')
  , Promise = diva.Promise
  , fs      = require('fs')

var Person = function() {};

Person.prototype.goToStore = function(weight) {
  var that = this;
  return that.queue(function goToStore(result) {
    return new Promise(function (resolve, reject) {
      console.log(that.name + " went to the store");
      resolve('Store');
    });
  });
}

Person.prototype.google = function(query) {
  var that = this;
  return that.queue(function google(result) {
    return new Promise(function (resolve, reject) {
      console.log('googling')
      query = query || result;
      var url = "https://www.google.com/#q=" + query;
      request(url, function (err, response, body) {
        if(err) reject(err);
        resolve(body);
      });
    });
  });
}

Person.prototype.save = function(fileName) {
  var that = this;
  return that.queue(function save(result) {
    return new Promise(function (resolve, reject) {
      fs.writeFile(fileName, result, function(err) {
        if(err) reject(err);
        resolve(fileName);
      });
    });
  });
}

/***********/
diva(Person);

var john = new Person();

var mary = new Person();

john.name = "John"
mary.name = "Mary"

var end = {
  onReceive: function(msg) {
    console.log("***End Scene***")
  }
}

john
  .display()
  .send(mary, "Mary I am going to the store for 10 seconds.")
  .goToStore()
  .set('location')
  .pause(10000)
  .mail(mary, "(Mail) John->Mary: I'm not coming home for another 10 seconds")
  .pause(10000)
  .recieve(function onReceive(msg) {
    if(msg === 'Where are you John?') {
      console.log('John: I am at the ' + this.location)
    }

    this
      .empty()
      .display('John: What a nag...')
      .send(end)
      .run()
   })
  .display("John: I'm back!!!")
  .run('Actor: John')
  .display('Will not show up')

mary
  .display()
  .pause(2000)
  .display('**Mary is twiddling her thumbs**')
  .pause(15000)
  .display('Mary: John is not back yet')
  .display('Mary: Let me ask where he is.')
  .send(john, 'Where are you John?')
  .display("Mary: Why don't I check the mail...")
  .retrieve()
  .display()
  .after('display', function onAfter(result) {
    return new Promise(function (resolve, reject) {

      console.log('(Mary talks a lot)');
      resolve(result);
    });
   })
  .google('google')
  .save(__dirname + '/test.txt')
  .recieve(function(msg) {
    console.log('John->Mary: ' + msg);
  })
  .display('((Sleep))')
  .run('Actor: Mary')
  .display('Will show up')
  .run()
  .error( function(msg) {
      console.log(msg)
  })

console.log('***Begin Scene***')
