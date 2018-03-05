import createReducer, { objectActionHandler } from '../src';

const defaultState = { counter: 0 };
let state = Object.assign({}, defaultState);

const handleAddSubtract = {
  '$defaultState': 0,
  'ADD': (state, action) => (state + 1),
  'SUBTRACT': (state) => (state - 1),
};

const handleAddTodo = {
  '$defaultState': [],
  'TODO_INSERT': (state, action) => Array.concat(state, action.value),
};

const nestedReducer = createReducer(
  {},
  {
    nested_counter: handleAddSubtract,
  },
  objectActionHandler
);

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

console.log(reducer.handlers);

let previousState = state;

const dispatch = (action) => {
  previousState = state;
  state = reducer(state, action);
  if (state !== previousState) console.log('state changed!');
  console.log(state);

  return state;
};

console.log(state);
dispatch({ type: 'ADD' });
dispatch({ type: 'ADD2' });
dispatch({ type: 'ADD' });
dispatch({ type: 'SUBTRACT' });
dispatch({ type: 'TODO_INSERT', value: 'Do the dishes' });
