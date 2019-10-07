import React, { useEffect } from 'react';
import CN from 'classnames';
import localforage from 'localforage';

import App from './App.js';
import Modal from './Modal.js';
import NewVideoForm from './NewVideoForm.js';
import { useUpdate, useLoader, getPlayerDataFromUrl } from '../utils.js';

const STORAGE_KEY = 'state-tree';
const PERSIST_FILTER = ['user'];

//
// Dom tree
// - #root     (<- from index.html)
//   - #modal
//   - #app
//
const Root = () => {

  // Mini redux system
  const [state, update] = useUpdate({
    playerData: {
      videoId: null,
      subtitleInfo: { tracks: [], translations: [] },
      subtitleUrl1: null,
      subtitleUrl2: null,
      entries: []
    },
    modal: null,
    user: {
      id: null,
      token: null,
      decks: [],
      practiceDecks: [],
      preference: {
        lang1: 'ru',
        lang2: 'en',
      }
    },
  });

  const actions = {
    update: update,
    // update: (...args) => { console.log(...args); update(...args) },

    setPlayerData: (videoId, entries) => {
      actions.update({ $merge: {
        playerData: { videoId, entries },
        modal: null
      }})
    },

    setModal: (modal) => {
      actions.update({ $merge: { modal }});
    },
  }

  const [_getPlayerDataFromUrl, { loading }] = useLoader(getPlayerDataFromUrl)

  // On mount (i.e. on initial page load)
  useEffect(() => {
    // Web Share Target handler (cf. https://wicg.github.io/web-share-target/level-2/)
    const sharedUrl = (new URL(window.location)).searchParams.get('share_target_text');
    if (sharedUrl) {
      const { lang1, lang2 } = state.user.preference;
      (async () => {
        const { value, state: { error } } = await _getPlayerDataFromUrl(sharedUrl, lang1, lang2);
        if (error) {
          console.error(error); window.alert('Failed to load video');
        } else {
          actions.update({ $merge: { playerData: value }});
        }
      })();
    } else {
      actions.setModal(
        <NewVideoForm {...{
          actions,
          defaultVideoId: null,
        }} />
      );
    }

    // Restore last state
    localforage.getItem(STORAGE_KEY).then(
      (lastState) => {
        if (lastState) {
          update({ $merge: lastState });
          update({ RESTORE_DONE: { $set: true } });
        }
      },
      (err) => console.error(err.message) // Operation could fails (e.g. storage size limit)
    );
  }, []);

  // Persist current state
  useEffect(() => {
    if (state.RESTORE_DONE) {
      localforage.setItem(STORAGE_KEY, _.pick(state, PERSIST_FILTER));
    }
  }, [state]);


  const modalProps = {
    content: state.modal,
    setContent: actions.setModal,
  };
  const appProps = {
    actions,
    playerData: state.playerData
  }
  return (
    <>
      <div id='root-spinner' className={CN({ loading })} />
      <Modal {...modalProps} />
      <App {...appProps}/>
    </>
  );
}

export default Root;
