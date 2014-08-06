var request = require('request')
  , diva    = require('../index')
  , Promise = require('rsvp').Promise
  , fs      = require('fs')

var Person = function() {
  this.name = "John Smith"
  this.gender = "male"
  this.strength = 100;
}

var Other = function() {
  this.name = "Mary Smith"
  this.gender = "female"
  this.strength = 200;
}

Person.prototype.goToStore = function(weight) {
  var that = this;
  return that.generate(function goToStore(result) {
    return new Promise(function (resolve, reject) {
      console.log(that.name + " went to the store");
      resolve('Store');
    });
  });
}

Other.prototype.google = function(query) {
  var that = this;
  return that.generate(function google(result) {
    return new Promise(function (resolve, reject) {
      query = query || result;
      var url = "https://www.google.com/#q=" + query;
      console.log('Making request to ' + url);
      request(url, function (err, response, body) {
        if(err) reject(err);
        console.log('Success!')
      });
    });
  });
}

Other.prototype.save = function(fileName) {
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

/***********/
diva(Person);
diva(Other);

var john = new Person();
var mary = new Other();

john
  .display()
  .send(mary, "Mary I am going to the store for 10 seconds.")
  .goToStore()
  .set('location')
  .pause(10000)
  .mail(mary, "I'm not coming home")
  .onRecieve(function(msg) {

    if(msg === 'Where are you John?') {
      console.log('John: ' + this.location)
    }

    this
      .display('(Delayed Reaction) What a nag...')
   })
  .pause(10000)
  .display("I'm back!!!")
  .run('I am John')

mary
  .display('I am Mary')
  .pause(5000)
  .display('Mary is twiddling her thumbs')
  .pause(12000)
  .display('John is not back yet')
  .display('Let me ask where he is.')
  .send(john, 'Where are you John?')
  .display("Why don't I check the mail...")
  .retrieve()
  .display()
  .after('display', function(result) {
    return new Promise(function (resolve, reject) {
      console.log(' (Mary talks a lot)')
      resolve(result);
    });
   })
  .google('google')
  .save(__dirname + '/test.txt')
  .onRecieve(function(msg) {

    console.log('John->Mary: ' + msg);
  })
  .run()
  .pause(1000)
  .display('((Sleep))')
  .run()

console.log('***Begin Scene***')
