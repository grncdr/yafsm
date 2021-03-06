process.browser = true
var fs = require('fs')
var concat = require('concat-stream')
var mdCodeBlocks = require('markdown-code-blocks')
var test = require('tape')

var FSM = require('./');

test('README examples', function (t) {
  fs.createReadStream(__dirname + '/README.md')
    .pipe(mdCodeBlocks('javascript'))
    .pipe(concat(function (code) {
      evalScope(t, code.toString('utf8'))
      function evalScope (t, code) {
        eval(code)
        t.end()
      }
    }))
})

test('state machine returns error on illegal transition', function (t) {
  var sm = new FSM('s1', {
    's1': ['s2'],
    's2': ['s3']
  })
  t.plan(1);
  t.equal(sm.state('s3').constructor,
          FSM.IllegalTransitionError)
});

test('calling state machine methods in unimplemented states', function (t) {
  var sm = new FSM('s1', {s1: ['s2']});
  sm.myMethod = FSM.method('myMethod', {
    // no implementation for s1
    's2': function () {}
  });

  t.plan(2);

  sm.myMethod('with callback', function (err) {
    t.equal(err.constructor,
            FSM.UndefinedMethodError,
            "Sends error to callback if one is present");
  })

  sm.myMethod('without callback');

  sm.once('error', function (err) {
    t.equal(err.constructor,
            FSM.UndefinedMethodError,
            "Emits 'error' event when there is no callback");
  });

});
