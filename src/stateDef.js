import React from 'react';
import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';
import thunk from 'redux-thunk';
import _ from 'lodash';
import update from 'immutability-helper';
import localforage from 'localforage';
import { Observable } from 'rxjs';

//
// Utilities (not specific to our usage)
//
export const getSelector = _.memoize((path) => (S) => _.get(S, path));
export const useGetSelector = (path) => useSelector(getSelector(path));
export const useRootState = () => useSelector((S) => S);
export const useBindedActions = (actions) => bindActionCreators(actions, useDispatch());
export const fromStore = (store) => {
  const observable = new Observable(subscriber => {
    const unsubscribe = store.subscribe(() => {
      subscriber.next(store.getState());
    });
    return unsubscribe;
  });
  return observable;
}

//
// Our State Management
//

const STORAGE_KEY = 'state-tree';
const STORAGE_FILTER = ['userData'];

const initialState = {
  playerData: {
    videoId: null,
    subtitleInfo: { tracks: [], translations: [] },
    subtitleUrl1: null,
    subtitleUrl2: null,
    entries: []
  },
  modal: null,
  userData: {
    id: null,
    token: null,
    decks: [],
    practiceDecks: [],
    preference: {
      lang1: 'ru',
      lang2: 'en',
    }
  },
  loadingStorage: true,
}

// NOTE:
// `update` (from immutability-helper) itself is our reducer.
// But redux uses `{ type: 'INIT' }` when `createStore` so `type` needs to be handled
const reducer = (state, action) => {
  console.log('[REDUCER]', state, action);
  return action.type === '$UPDATE' ? update(state, action.command) : state;
}

const actions = {
  // the rest of actions should use `actions.update` and `actions.merge` as a shortcut
  // but don't forget to wrap as in `D(actions.update(...))`
  update: (command) => (D, S) => D({ type: '$UPDATE', command }),
  merge: (next) => (D, S) => D(actions.update({ $merge: next })),

  setModal: (modal) => (D, S) => D(actions.merge({ modal })),
  restoreFromStorage: () => async (D, S) => {
    const lastState = await localforage.getItem(STORAGE_KEY);
    if (lastState) {
      D(actions.merge(_.pick(lastState, STORAGE_FILTER)));
    }
    D(actions.merge({ loadingStorage: false }));
  },
  persisteToStorage: () => async (D, S) => {
    const stateToPersist = _.pick(S(), STORAGE_FILTER);
    await localforage.setItem(STORAGE_KEY, stateToPersist);
  },
}

const setupStorage = async (store) => {
  const { restoreFromStorage, persisteToStorage } = bindActionCreators(actions, store.dispatch);

  // Restore from storage
  await restoreFromStorage();

  // Syncronize storage with state tree
  fromStore(store).subscribe(async (state) => {
    await persisteToStorage();
  });
}

// Convinient shortcut for component
export const useActions = () => useBindedActions(actions);

// Option is for story.js testing
export const createProvider = ({ storage = false, initialCommand = false }) => {
  const store = createStore(reducer, initialState, applyMiddleware(thunk));
  if (initialCommand) {
    store.dispatch(actions.update(initialCommand));
  }
  if (storage) {
    // Don't await this promise
    setupStorage(store);
  }
  const _Provider = (props) => <Provider store={store} {...props} />;
  return _Provider;
}
