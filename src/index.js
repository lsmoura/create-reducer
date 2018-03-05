const __DEV__ = process.env.NODE_ENV !== 'production';

const dummyWrapper = (func) => (state, action) => func(state,action);

export const objectActionHandler = (func) => (state, action) => Object.assign(
  {},
  state,
  func(state, action),
);

export const arrayActionHandler = (func) => (state, action) => state.concat(
  func(state, action)
);

function addHandler(handlerObject, actionType, handler) {
  if (typeof handler !== 'function') {
    console.error(`addHandler(): handler of type ${typeof handler} is not supported. We need a function.`);
  }

  if (!handlerObject[actionType]) {
    handlerObject[actionType] = handler;
    return handlerObject;
  }

  if (Array.isArray(handlerObject[actionType])) {
    handlerObject[actionType].push(handler);
    return handlerObject;
  }

  if (typeof handlerObject[actionType] === 'function') {
    const handlerArray = [
      handlerObject[actionType],
      handler,
    ];

    handlerObject[actionType] = handlerArray;
    return handlerObject;
  }

  console.error(`addHandler(): invalid handler for ${actionType}: ${typeof handerObject[actionType]}`);

  return handlerObject;
}

const extractKeyWrapper = (key, handler, defaultState) => (state, action) => {
  const innerState = (state && state[key] !== undefined) ? state[key] : defaultState;
  const nextState = handler(innerState, action);
  const returnValue = {};
  returnValue[key] = nextState;
  return returnValue;
};

function generateHandlers(initialState, handlers, handlerWrapper) {
  const internalHandlers = {};

  Object
    .keys(handlers)
    .filter(actionType => actionType[0] !== '$')
    .forEach(actionType => {
      const handler = handlers[actionType];

      if (typeof handler === 'object') {
        const initialInternalState = initialState && initialState[actionType];
        const innerHandlers = generateHandlers(initialInternalState, handler);

        const defaultState = handler['$defaultState'];

        Object.keys(innerHandlers).forEach(handlerKey => {
          const handler = innerHandlers[handlerKey];
          addHandler(internalHandlers, handlerKey, extractKeyWrapper(actionType, handler, defaultState));
        });
      } else if (typeof handler === 'function') {
        addHandler(internalHandlers, actionType, handler, handlerWrapper);
      } else {
        console.error(`generateHandlers(): invalid handler type for action ${actionType}: ${typeof handler}`);
      }
    });

  return internalHandlers;
}

function createReducer(initialState, handlers, wrapper) {
  if (__DEV__) {
    if (handlers['undefined']) {
      console.warn('createReducer(): Reducer contains an \'undefined\' action type. Have you misspelled a constant?');
    }
  }

  if (wrapper && typeof wrapper !== 'function') {
    throw new Error('createReducer(): You passed a wrapper parameter to createReducer, but it\'s not a function.');
  }

  Object.keys(handlers).forEach(key => {
    if (typeof handlers[key] !== 'function' && typeof handlers[key] !== 'object') {
      throw new Error(`createReducer(): You passed a value for the '${key}' action that is not a function nor an object.`);
    }
  });

  const internalHandlers = generateHandlers(initialState, handlers);
  const innerWrapper = wrapper ? wrapper : dummyWrapper;

  const reducer = (stateParameter, action) => {
    const state = stateParameter === undefined ? initialState : stateParameter;
    const handler = internalHandlers[action.type];
    if (!handler) return state;

    if (typeof handler === 'function') {
      return innerWrapper(handler)(state, action);
    }

    if (Array.isArray(handler)) {
      return handler.reduce(
        (innerState, currentHandler) => innerWrapper(currentHandler)(innerState, action),
        state
      );
    }

    console.warn(`invalid handler type for action ${action.type}: ${typeof handler}`);

    return state;
  };

  reducer.handlers = internalHandlers;

  return reducer;
}

export default createReducer;
