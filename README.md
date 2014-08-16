# diva

**still in development mode**

## Overview

This module is a base to write node modules with clear, concise, and expressive code. It provides a base class, methods, and patterns for creating concurrent,
actor-based javascript.

Basically, the goal is to allow expressive, simple scripting like this:

```javascript

var jimmy = new Person();
var dana  = new Person();

diva(jimmy);
diva(dana);

jimmy
  .jog('10mph')
  .stopJogging()
  .pause(10000)
  .walk('2 miles')
  .send(dana)
  .after('stopJogging', function(result) {
    return new Promise(function(resolve, reject) {
      jimmy
        .say('Resting...');
    }
  })
  .jog('10mph')
  .run()
 ...

dana
  .study()
  .pause(2000)
  .onReceipt(function(msg) {

    dana
      .say('How many miles did jimmy jog?')
      .say(msg);

  })
  .pause(4000)
  .run()

```

More generally, expanding this module with other popular modules like request
can create simple and expressive client side modules for interacting with apis.

```javascript

client
  request('www.somesite.com/api/get/5')
  parse()
  save(__dirname + '/people')
```

The module depends on RSVP, but any promise library including native ES6 Promises
should work.

<br/>
## Installation

<br/>
This module is installed via npm:

``` bash
$ npm install diva
```

<br/>
## API

### Initialization

Use diva(<Class>) to add the Diva skeleton to the class:

```js
var diva = require('diva');

var Person = function() {
  this.name = 'Name';
}

diva(Person);
```

### that.queue( fn )

##### Description

Creates a function to create a promise in the internal queue.  Use with
prototypes to create chainable waterfall promises.

```js
that.queue(function <name>(result) {
  return new Promise(function (resolve, reject)) {

  //logic goes here
});
```

<br/>
<br/>

### run

##### Description

Run the current queue, passing in a value to the first method in the chain.

```js
.run([value])
```
<br/>
<br/>

### stop

##### Description

Stop running the queue.

```js
.stop()
```
<br/>
<br/>

### empty

##### Description

Empty the current queue.

```js
.empty()
```
<br/>
<br/>


### before, after

##### Description
Add a promise before or after every time a particular method is called
in the chain
```js
.after(<name>, function(result) {
  return new Promise(function (resolve, reject) {
    //logic here
    resolve(<waterfall value>);
  });
})
```
<br/>
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
.get(<name>)
```

<br/>
<br/>
### remove

##### Description

Get and remove a property of the diva object and send it down the waterfall

```js
.remove(<name>)
```

<br/>
<br>
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
.change(<value>)
```
<br/>

### send

##### Description

Send the current value (or a specified message) to another diva chain that
will receive the message with onReceipt (it does not have to be a diva object)

```js
.change(<receiver>, [message])
```

### mail

##### Description

Mail a current value to another diva chain that will receive the message and put it
in its mailbox

```js
.change(<receiver>, [message])
```

### onReceive( fn(msg) { })

##### Description

Receive the value from a sender.  Execute immediately, or call diva methods from the
callback and run to run synchronously after the current queue.

### isRunning()

##### Description

Returns true if the diva object is running a queue

### retrieve(<x>)

##### Description

Pull the bottom (oldest) x values out of the mailbox

### draw(<x>)

##### Description

Pull the top (recent) x values out of the mailbox


## Example Usage

``` js
var request = require('request')
  , diva    = require('../index')
  , Promise = require('rsvp').Promise
  , fs      = require('fs')
```

Create any type of "object"
``` js
var Person = function() { }
```

Add the diva prototypes to the object type.

```js
Person = diva(Person);
```

Create methods with a specific signature:

```js
  var that = this;
  return that.queue(function <name>(result) {
    return new Promise(function (resolve, reject)) {

    resolve(<value-to-pass>)
    });
  });
```

Chain methods together and send messages to other diva objects (or any message handler)

```js

john.name = 'john'
mary.name = 'mary'

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

```
