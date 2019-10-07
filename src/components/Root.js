import React, { useState, useEffect } from 'react';

import App from './App.js';
import Modal from './Modal.js';
import Settings from './Settings.js';

//
// Dom tree
// - #root     (<- from index.html)
//   - #modal
//   - #app
//
const Root = () => {
  const [videoId, setVideoId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [modalContent, setModalContent] = useState(null);

  const setPlayerData = (videoId, entries) => {
    setVideoId(videoId);
    setEntries(entries);
    setModalContent(null);
  }

  const actions = {
    showSettings: (defaultVideoId = '') => {
      setModalContent(<Settings {...{ defaultVideoId, setPlayerData }}/>)
    }
  }

  // On mount
  useEffect(() => {
    // Web Share Target handler (cf. https://wicg.github.io/web-share-target/level-2/)
    const sharedUrl = (new URL(window.location)).searchParams.get('share_target_text');
    actions.showSettings(sharedUrl);
  }, []);

  return (
    <>
      <Modal content={modalContent} setContent={setModalContent} />
      <App {...{
        videoId,
        entries,
        actions
      }}/>
    </>
  );
}

export default Root;
