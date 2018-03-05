import createReducer, { objectActionHandler } from '../src';

const defaultState = {
  'default': 'state',
};

const reducer = createReducer(defaultState, {});

const state = reducer(undefined, { type: '@INIT' });
if (state !== defaultState) {
  console.error('state must be defaultState when the reducer receives an undefined state!');
}
