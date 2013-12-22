# yet-another-finite-state-machine

Because there simply aren't enough packages on npm yet. [![Build Status](https://travis-ci.org/grncdr/yafsm.png?branch=master)](https://travis-ci.org/grncdr/yafsm)

## Synopsis

Defining the FSM:

```javascript
var door = new FSM('closed', {
  'closed': ['open'],
  'open': ['closed'],
})
```

State transitions use the `state` method:

```javascript
t.test("Moving between states", function (t) {
  t.plan(4)
  t.equal(door.state(), 'closed')
  t.ok(!door.state('open'), "successful state change returns undefined")
  t.equal('open', door.state())
  t.ok(door.state('broken'), "FSM.IllegalTransitionError")
})
```

There is also a helper function for defining stateful methods:

```javascript
t.test("Defining state-aware methods", function (t) {
  door.open = FSM.method('open', {
    'closed': function () { return this.state('open') }
  })

  door.close = FSM.method('close', {
    'open': function () { return this.state('closed') }
  })

  t.plan(2)
  t.equal(door.state(), 'open')
  door.close()
  t.equal(door.state(), 'closed')
})
```

Because `close` is not defined for the `'closed'` state, further calls cause
errors:

```javascript
t.test("undefined method errors", function (t) {
  t.plan(2)

  // if last arg is function it is assumed to be a node callback
  door.close(function (err) {
    t.ok(err instanceof FSM.UndefinedMethodError);
  })

  // otherwise the error is emitted on the next tick
  door.close()
  door.once('error', function (err) {
    t.ok(err instanceof FSM.UndefinedMethodError);
  })
})
```

## API

```ocaml
module.exports := FSM

FSM(initialState: String, transitions: Object<Array<String>>) => FSM

FSM := EventEmitter & {
  state: (to: String?) => FSM.IllegalTransitionError?
}

FSM.method := (name: String, Object<Function>) => dispatch: Function

FSM.IllegalTransitionError := Error & {
  from: String
  to:   String
}

FSM.UndefinedMethodError := Error & {
  method: String
  state:  String
}
```

### new FSM(initialState, transitions)

Creates an object with a `state` method (described below). `transitions` should
be an object that where the keys are state names, and the values are arrays of
all states that can be legally transitioned to from that state. For example:


### FSM.prototype.state

Given `fsm instanceof FSM`, `fsm.state()` will return the current state, and
`fsm.state(newState)` will attempt to transition to `newState`. If the
transition to `newState` is not allowed, an `FSM.IllegalTransitionError` will be
returned, otherwise nothing is returned.

A state transition causes 2 events to be emitted:

 * `'transition', currentState, newState` is emitted before the internal state
   is updated.
 * `newState` is emitted after the internal state is updated.

### FSM.method

Creates a stateful method that dispatches on the call-time value of
`this.state()`. The first argument should be a method name (which will be used
when creating `UndefinedMethodError` instances, and the second argument should
be an object mapping state-names to the method implementation for each state. If
the same implementation should be shared among multiple states, the state names
can be joined with a pipe character:

```javascript
t.test("shared implementations of stateful methods", function (t) {
  t.plan(2)
  door.knock = FSM.method('knock', {
    'open|closed': function () {
      t.pass("knocking on door while it's " + this.state())
    }
  })
  door.knock()
  door.open()
  door.knock()
})
```

## License

2-clause BSD
