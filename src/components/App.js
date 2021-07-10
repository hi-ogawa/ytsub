import React, { useRef, useEffect } from "react";
import _ from "lodash";
import CN from "classnames";

import "../typedef.js";
import { useGetSelector, useActions } from "../stateDef.js";
import {
  Player,
  secondToTimestamp,
  stopProp,
  useUpdate,
  squashWhitespace,
} from "../utils.js";
import NewVideoForm from "./NewVideoForm.js";
import LanguageSelectForm from "./LanguageSelectForm.js";
import Settings from "./Settings.js";

//
// Dom Tree (cf. app.scss)
// - #app
//   - #player-container
//   - #subtitle-and-nav-container
//     - #subtitle-container
//     - #nav
//

const App = () => {
  const { videoId, entries } = useGetSelector("playerData");
  const { setModal } = useActions();

  //
  // State definition
  //
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const currentEntryRef = useRef(null);
  const [
    { loopingEntries, currentTime, playing, autoScroll },
    __,
    ___,
    mergeState,
  ] = useUpdate({
    loopingEntries: [],
    currentTime: 0,
    playing: false,
    autoScroll: false,
  });
  const currentEntry = _.reverse(Array.from(entries)).find(
    (e) => e.begin <= currentTime
  );

  //
  // On mount (after render)
  //
  useEffect(() => {
    const player = (playerRef.current = new Player(iframeRef.current, {
      videoId,
      height: "480",
      width: "853", // Exact size will be set via css.
      playerVars: {
        autoplay: "0",
        start: 0,
      },
    }));

    player.readyPromise.then(() => {
      // Syncronize state with player
      const INTERVAL = 250;
      player.getObservable(INTERVAL).subscribe(mergeState);
    });

    // On unmount (not called except hot-reload on development)
    return () => player.ready && player.destroy();
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
        const begin = _.min(loopingEntries.map((e) => e.begin));
        const end = _.max(loopingEntries.map((e) => e.end));
        if (currentTime < begin || end < currentTime) {
          player.seekTo(begin);
        }
      }
    }
  }, [currentTime, loopingEntries]);

  //
  // Handle auto scroll
  //
  useEffect(() => {
    if (!autoScroll || !currentEntry || !currentEntryRef.current) {
      return;
    }
    const child = currentEntryRef.current;
    const parent = child.parentElement;
    const hp = parent.clientHeight;
    const hc = child.clientHeight;
    const op = parent.offsetTop;
    const oc = child.offsetTop;
    parent.scroll({ top: oc - op + hc / 2 - hp / 2, behavior: "smooth" });
  }, [autoScroll, currentEntry]);

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
  };

  const toggleLoopingEntry = (entry) => {
    let nextLoopingEntries;
    if (loopingEntries.includes(entry)) {
      nextLoopingEntries = _.filter(loopingEntries, (e) => e !== entry);
    } else {
      nextLoopingEntries = _.concat(loopingEntries, [entry]);
    }
    mergeState({ loopingEntries: nextLoopingEntries });
  };

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
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => togglePlayingEntry(entry)}
              className={CN("entry", {
                play: entry === currentEntry && playing,
                paused: entry === currentEntry && !playing,
                loop: loopingEntries.includes(entry),
                rate: false,
              })}
              ref={entry === currentEntry ? currentEntryRef : undefined}
            >
              <div className="entry__header">
                {/* TODO: Not implemented */}
                {false && (
                  <div className="log">
                    {entry.rates.map((rate) => (
                      <div>{rate.value}</div>
                    ))}
                  </div>
                )}
                <div className="time">
                  {secondToTimestamp(entry.begin)} -{" "}
                  {secondToTimestamp(entry.end)}
                </div>
                {/* TODO: Not implemented */}
                {false && (
                  <div className="rate">
                    <i className="material-icons">edit</i>
                  </div>
                )}
                <div
                  onClick={stopProp((e) =>
                    e.currentTarget.querySelector("form").submit()
                  )}
                  className="typing-test"
                >
                  <i className="material-icons">keyboard</i>
                  <form
                    target="_blank"
                    method="POST"
                    action="https://www.keyhero.com/custom-typing-test/"
                  >
                    <input
                      type="hidden"
                      name="text"
                      value={squashWhitespace(entry.text1)}
                    />
                  </form>
                </div>
                <div
                  onClick={stopProp(() => toggleLoopingEntry(entry))}
                  className="loop"
                >
                  <i className="material-icons">repeat</i>
                </div>
                <div
                  onClick={stopProp(() => togglePlayingEntry(entry))}
                  className="play"
                >
                  <i className="material-icons">play_circle_outline</i>
                </div>
              </div>
              <div className="entry__body">
                <div>{entry.text1}</div>
                <div>{entry.text2}</div>
              </div>
            </div>
          ))}
        </div>
        <div id="nav">
          <div
            onClick={() =>
              setModal(<NewVideoForm {...{ defaultVideoId: null }} />)
            }
          >
            <i className="material-icons">search</i>
          </div>
          <div
            className={CN({ disabled: !videoId })}
            onClick={() => videoId && setModal(<LanguageSelectForm />)}
          >
            <i className="material-icons">edit</i>
          </div>
          <div onClick={() => setModal(<Settings />)}>
            <i className="material-icons">settings</i>
          </div>
          <div
            className={CN({ enabled: autoScroll })}
            onClick={() => mergeState({ autoScroll: !autoScroll })}
          >
            <i className="material-icons">double_arrow</i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
