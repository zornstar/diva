# diva

Expressive waterfall chaining using promises

<br/>
## Installation

<br/>
This module is installed via npm:

``` bash
$ npm install diva
```

<br/>
## Overview

This module provides a few methods and patterns for creating
a single object script for chaining synchronous and asynchronous
events in an expressive, waterfall like matter.  Each "result" is passed
to the next object.

The only dependency is RSVP, but any promise library including ES6 Promises
should work.

<br/>
## API

### this.generate

##### Description

Creates a function to create a promise in the internal queue.  Use with
prototypes to create chainable waterfall promises.

```js
that.generate(function <name>(result) {
  return new Promise(function (resolve, reject)) {

  //logic goes here
});
```

<br/>
### before, after

##### Description
Add a promise before or after every time a particular method is called
in the change
```js
.after(<name>, function(result) {
  return new Promise(function (resolve, reject) {
    //logic here
    resolve(<waterfall value>);
  });
})
```

<br/>
### set

##### Description

Set the waterfall value as a property of the diva object (for later reference.)
If a value is spacified, then that value will be set and passed down the
waterfall.

```js
.set(<name>, [value])
```
<br/>
<br/>
### get

##### Description

Get a property of the diva object and send it down the waterfall

```js
.get(<name>, [value])
```

<br/>
### display

##### Description

Display the current waterfall value or a string.  The current waterfall
value passes through in either case.

```js
.display(<string>)
```

<br/>
### pause

##### Description

Pause the chain for a certain amount of time

```js
.pause(<time>)
```
<br/>
### change

##### Description

Change the waterfall value

```js
.change(<time>)
```
<br/>
### fork

##### Description

Send the current value to another diva chain that will execute
after the current chain.  Will call run(value) on that chain
with the waterfall value on the fork point.  The waterfall value
passes throuhg.

```js
.fork(<diva>)
```

```js

Person = diva(Person);
var jim = new Person();
var jason = new Person();

jim
  .lift() //value = 200
  .lift() //value = 300
  .lift() //value = 400
  .fork(jason)
  .lift() //value = 500
  .display() //500
  .run()

jason
  .lift() //value = 400 + 100 = 500
  .lift() //value = 600
  .lift() //value = 700
  .display()
```
<br/>
<br/>

## Example Usage

``` js
var request = require('request')
  , diva    = require('../index')
  , Promise = require('rsvp').Promise
  , fs      = require('fs')
```

Create any type of "object"
``` js
var Person = function() {
  this.name = "John Smith"
  this.gender = "male"
  this.strength = 100;
}
```

Add the diva prototypes to the object type.

```js
Person = diva(Person);
```


Create methods with a specific signature:

```js
  var that = this;
  return that.generate(function <name>(result) {
    return new Promise(function (resolve, reject)) {

    //logic goes here
    });
  });
```
Use resolve to waterfall the next value to the next promise / chained method.

For example:

```js
Person.prototype.lift = function(weight) {
  var that = this;
  return that.generate(function lift(result) {
    return new Promise(function (resolve, reject) {
      that.strength+=100 //modify strength of object
      console.log('Strength: ' + that.strength);
      resolve(that.strength);//passes that.strength to the next item
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
/*SAMPLE*/

var john = new Person();

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
  //After injects itself after each method with the name in the first parameter
  //It takes a function with the same signature as other methods.
  .after('lift', function(result) {
    return new Promise(function (resolve, reject) {
      console.log('Wow!!!' + ' ' + result)
      console.log('That was exausting!')
      resolve(result);
    });
  })
  .get('first lift')
  .display()

  //Run the script from top to bottom, passing in the parameter as the initial
  //waterfall value.
  .run('from the top!')


```
=======
diva
====

A small framework to enable a waterfall of chained expressive methods returning promises
>>>>>>> 8b611f63870fe7f5926fc33309892a431a951489
