# Create Reducer

`yarn add @lsmoura/create-reducer`

This helper lets the user creates simple or nested reducers.

## API

### createReducer(initialState, handlers [, wrapper])

*initialState* is an object or value that represents the initial state.

*handlers* is an object that has the format `ACTION_NAME: reducer` or `key: handlers`.

Some examples:

```javascript
const handlers = {
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state, action) => (state - 1),
};
```

or

```javascript
const handlers = {
  'todo': {
    'ADD_TODO': (state, action) => state.concat(action.value),
  },
  'counter': {
    'ADD': (state, action) => (state + 1),
    'SUBTRACT': (state, action) => (state - 1),
  },
};
```

or even

```javascript
const counterHandlers = {
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state, action) => (state - 1),  
};
const handlers = {
  'todo': {
    'ADD_TODO': (state, action) => state.concat(action.value),
  },
  'counter': counterHandlers,
  'counter2': counterHandlers,
};
```

nested parameters will have their state extracted from the original state and
the result will be assigned back to the key.

you can nest parameters as much as you like:

```javascript
const counterHandlers = {
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state, action) => (state - 1),  
};

const handlers = {
  'deeply': {
    'nested': {
      'counter': counterHandlers,
    },
  },
};
```

the createReducer function will ignore any handler key that starts with `$`.
It will also send a default state for your reducer function if you provide
a key of `$defaultState` and there is no state value assigned to the key you
provide:

```javascript
const handlers = {
  '$defaultState': 0,
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state, action) => (state - 1),
};
```

*wrapper* is an optional parameter. it must be a function that will wrap your
reducer function. It's recommended to use `objectActionHandler` as this
parameter to help reduce the amount of "spreading" or
"[Assigning](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)"
on your reducers.

### objectActionHandler

This is a wrapper helper that assigns the returned state to the existing one, like so:

```javascript
function(reducer, state, action) {
  const reducerResult = reducer(state, action);

  return Object.assign({}, state, reducerResult);
}
```

## Examples

Every example assumes that the module is imported in the following way:

`import import createReducer, { objectActionHandler } from '@lsmoura/create-reducer';`

### Very simple counter

```javascript
const reducer = createReducer(
  0,
  {
    'ADD': (state, action) => (state + 1),
    'SUBTRACT': (state) => (state - 1),
  },
  objectActionHandler
);
```

### Counter with default state

```javascript
const reducer = createReducer(
  undefined,
  {
    '$defaultState': 0,
    'ADD': (state, action) => (state + 1),
    'SUBTRACT': (state) => (state - 1),
  },
  objectActionHandler
);
```

### Multiple counters that answer to the same action type

```javascript
const counterHandlers = {
  '$defaultState': 0,
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state) => (state - 1),
};

const reducer = createReducer(
  {},
  {
    counter: counterHandlers,
    counter2: counterHandlers,
  },
  objectActionHandler
);
```

### Mixed stuff

```javascript
const handleAddSubtract = {
  '$defaultState': 0,
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state) => (state - 1),
};

const handleAddTodo = {
  '$defaultState': [],
  'TODO_INSERT': (state, action) => Array.concat(state, action.value),
};

const reducer = createReducer(
  defaultState,
  {
    'ADD': (state, action) => ({ action_count: 1 + (state.action_count || 0) }),
    counter: handleAddSubtract,
    counter2: handleAddSubtract,
    nesting_todos: {
      inner_object: {
        todos: handleAddTodo,
      },
    },
    nested: nestedReducer.handlers,
  },
  objectActionHandler
);
```

## Author

[Sergio Moura](http://sergio.moura.ca)
