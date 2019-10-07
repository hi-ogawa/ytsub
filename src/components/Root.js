import React, { useState } from 'react';

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
    showSettings: () => {
      setModalContent(<Settings {...{ setPlayerData }}/>)
    }
  }

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
