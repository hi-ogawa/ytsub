// @ts-check
import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import CN from 'classnames';

import '../typedef.js';
import { Player, secondToTimestamp, stopProp } from '../utils.js'

/**
 * @param {{ videoId: (string|null), entries: [Entry], actions: Record<string,function> }} props
 * @return {JSX.Element}
 */
const App = ({ videoId, entries, actions }) => {
  //
  // State definition
  //
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [{ loopingEntries, currentTime, playing, }, setState] = useState({
    loopingEntries: [],
    currentTime: 0,
    playing: false,
  });
  const mergeState = (next) => setState(prev => ({...prev, ...next}));
  const currentEntry = _.reverse(Array.from(entries)).find(e => e.begin <= currentTime);

  //
  // On mount (after render)
  //
  useEffect(() => {
    const player = playerRef.current = new Player(iframeRef.current, {
      videoId,
      height: '480', width: '853', // Exact size will be set via css.
      playerVars: {
        autoplay: '0',
        start: 0
      },
    });

    player.readyPromise.then(() => {
      // Syncronize state with player
      const INTERVAL = 250;
      player.getObservable(INTERVAL).subscribe(mergeState);
    });

    // On unmount (not called except hot-reload on development)
    return () => { console.log(`:: destrucing iframe (${videoId})`); player.ready && player.destroy(); };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (player && player.ready) {
      player.setVideo(videoId);
    }
  }, [videoId]);

  //
  // Handle loop
  //
  useEffect(() => {
    const player = playerRef.current;
    if (player && player.ready) {
      if (loopingEntries.length > 0) {
        const begin = _.min(loopingEntries.map(e => e.begin));
        const end = _.max(loopingEntries.map(e => e.end));
        if (currentTime < begin || end < currentTime) {
          player.seekTo(begin);
        }
      }
    }
  }, [currentTime, loopingEntries])

  //
  // Callbacks
  //
  const togglePlayingEntry = (entry) => {
    if (!loopingEntries.includes(entry)) {
      mergeState({ loopingEntries: [] });
    }
    const player = playerRef.current;
    if (player && player.ready) {
      if (entry == currentEntry) {
        if (!playing) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } else {
        player.seekTo(entry.begin);
        player.playVideo();
      }
    }
  }

  const toggleLoopingEntry = (entry) => {
    let nextLoopingEntries;
    if (loopingEntries.includes(entry)) {
      nextLoopingEntries = _.filter(loopingEntries, e => e !== entry);
    } else {
      nextLoopingEntries = _.concat(loopingEntries, [entry]);
    }
    mergeState({ loopingEntries: nextLoopingEntries });
  }

  //
  // Render
  //
  return (
    <div id="app">
      <div id="player-container">
        <div id="player-aspect-ratio-fixer1">
          <div id="player-aspect-ratio-fixer2">
            {/* NOTE: Youtube Iframe library mutates DOM to become iframe */}
            <div id="player-iframe" ref={iframeRef} />
          </div>
        </div>
      </div>
      <div id="subtitle-and-nav-container">
        <div id="subtitle-container">
          { entries.map((entry) =>
            <div
              key={entry.id}
              onClick={() => togglePlayingEntry(entry)}
              className={CN('entry', {
                play: entry === currentEntry && playing,
                paused: entry === currentEntry && !playing,
                loop: loopingEntries.includes(entry),
                rate: false,
              })}
            >
              <div className="entry__header">
                {/* TODO: Not implemented */}
                { false &&
                  <div className="log">
                    { entry.rates.map((rate) =>
                        <div>{ rate.value }</div>
                      )}
                  </div>
                }
                <div className="time">{ secondToTimestamp(entry.begin) } - { secondToTimestamp(entry.end) }</div>
                {/* TODO: Not implemented */}
                { false &&
                  <div className="rate">
                    <i className="material-icons">edit</i>
                  </div>
                }
                <div onClick={stopProp(() => toggleLoopingEntry(entry))} className="loop">
                  <i className="material-icons">repeat</i>
                </div>
                <div onClick={stopProp(() => togglePlayingEntry(entry))} className="play">
                  <i className="material-icons">play_circle_outline</i>
                </div>
              </div>
              <div className="entry__body">
                <div>{ entry.text1 }</div>
                <div>{ entry.text2 }</div>
              </div>
            </div>
          )}
        </div>
        <div id="nav">
          <div onClick={() => actions.showSettings()}>
            <i className="material-icons">search</i>
          </div>
          { ['?', '?'].map((v, i) => <div key={i} className="disabled">{v}</div>) }
          <div className='disabled'>
            <i className="material-icons">history</i>
          </div>
          <div className='disabled'>
            <i className="material-icons">settings</i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
