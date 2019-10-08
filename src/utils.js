// NOTE: This file is loadable to nodejs (cf. npm run node-utils)
import { useState, useReducer } from 'react';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';
import { interval } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import update from 'immutability-helper';

//
// Misc utility
//

export const ASSERT = (bool, message) => bool || window.alert(message)

export const stopProp = (f) => (e) => {
  e.stopPropagation();
  return f(e);
}

// Inspired by "useMutation" from apollo-client
export const useLoader = (origF /* promise returning function */) => {
  const [state, setState] = useState({ loading: false, error: null });
  const newF = (...args) => {
    setState({ loading: true, error: null });
    return origF(...args).then(
      (val) => {
        // NOTE:
        // If "origF" caused the component to be unmounted,
        // then this "setState" leads to warning.
        const nextState = { loading: false, error: null };
        setState(nextState);
        return { value: val, state: nextState };
      },
      (err) => {
        const nextState = { loading: false, error: err };
        setState(nextState);
        return { value: null, state: nextState };
      }
    );
  }
  return [ newF, state ];
}

// Implement `updateState` via reducer dispatch so that
// it won't use "old state" when it's invoked in closure (e.g. in promise handler).
// Also, with `getState`, it can fetch latest state even from closure.
// `mergeState` is just for convinience.
export const useUpdate = (initialState) => {
  const reducer = (state, action) => {
    if (action.type === 'UPDATE') {
      return update(state, action.command);
    }
    if (action.type === 'GET_STATE') {
      action.loophole(state);
      return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);
  const updateState = (command) => dispatch({ type: 'UPDATE', command });
  const getState = () => {
    let currentState;
    dispatch({ type: 'GET_STATE', loophole: (state) => { currentState = state; } });
    return currentState;
  };
  const mergeState = (next) => updateState({ $merge: next });
  return [state, updateState, getState, mergeState];
};

//
// Youtube iframe wrapper
//

const getYoutubeIframeAPI = _.memoize(() => new Promise((resolve) => {
  window.onYouTubeIframeAPIReady = () => resolve(window.YT);

  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://www.youtube.com/iframe_api';
  let firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
}));

// cf. https://developers.google.com/youtube/iframe_api_reference
export class Player {
  constructor(node, options) {
    this.readyPromise = null; this.ready = false;
    this.YT = null;
    this.player = null;
    this.readyPromise = this.initialize(node, options);
  }
  async initialize(node, options) {
    this.YT = await getYoutubeIframeAPI();
    await new Promise((resolve) => {
      options = Object.assign({}, options, {
        events: {
          onReady: () => {
            this.ready = true;
            resolve();
          }
        }
      });
      this.player = new this.YT.Player(node, options);
    });
  }
  destroy() {
    this.player.destroy();
  }

  // Watch events by ourselves (Imitating MediaElement)
  // cf. https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
  getObservable(INTERVAL) {
    ASSERT(this.ready, '"getObservable" requires "this.ready == true"');
    return interval(INTERVAL).pipe(
      map(() => this.getState()),
      distinctUntilChanged(_.isEqual)
    );
  }
  getState() {
    return {
      currentTime: this.player.getCurrentTime(),
      playing: this.player.getPlayerState() == 1,
    }
  }

  seekTo(sec) {
    this.player.seekTo(sec);
  }
  pauseVideo() {
    this.player.pauseVideo();
  }
  playVideo() {
    this.player.playVideo();
  }
  setVideo(videoId) {
    this.player.cueVideoById(videoId);
  }
}

//
// Parsing Youtube Data
//

export const parseVideoId = (value) => {
  let videoId;
  if (value.length == 11) {
    videoId = value;
  } else if (value.match(/youtube\.com|youtu\.be/)) {
    let url;
    try {
      url = new URL(value);
      if (url.hostname == 'youtu.be') {
        videoId = url.pathname.substr(1);
      } else {
        videoId = url.search.match(/v=(.{11})/)[1];
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  return videoId;
}

export const findPreferredSubtitles = (subtitleInfo, lang1, lang2) => {
  const { tracks } = subtitleInfo;

  let subtitle1
  subtitle1 = _.find(tracks, { vssId: `.${lang1}` }); // Look for manually made subtitle
  if (!subtitle1) {
    subtitle1 = _.find(tracks, { vssId: `a.${lang1}` }); // Otherwise, use machine speech recognition
  }
  if (!subtitle1) {
    return { subtitleUrl1: null, subtitleUrl2: null };
  }
  const subtitleUrl1 = subtitle1.url;

  let subtitle2 = _.find(tracks, { vssId: `.${lang2}` }); // Look for manually made subtitle
  let subtitleUrl2 = _.get(subtitle2, 'url');
  if (!subtitleUrl2) {
    subtitleUrl2 = `${subtitleUrl1}&tlang=${lang2}`; // Otherwise, use machine translation
  }
  return  { subtitleUrl1, subtitleUrl2 }
};


const extractSubtitleInfo = (content) => {
  const mobj = content.match(/;ytplayer\.config\s*=\s*({.+?});ytplayer/);
  const config = JSON.parse(mobj[1]);
  const player_response = JSON.parse(config.args.player_response);
  let tracks = player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
  let translations = player_response.captions.playerCaptionsTracklistRenderer.translationLanguages;
  return {
    tracks: tracks.map(t => ({
      name: t.name.simpleText,
      url: `${t.baseUrl}&fmt=ttml`,
      vssId: t.vssId,
    })),
    translations: translations.map(t => ({
      name: `${t.languageName.simpleText} (auto-translated)`,
      code: t.languageCode
    }))
  };
}

// cf. https://github.com/hi-ogawa/apps-script-proxy
const PROXY_BASE_URL = 'https://script.google.com/macros/s/AKfycbwXJFqrRvPjvkNY5q1DNsIQuEG3hZVtUb_OFMJzhaYmxlw9IAN9qT-_Tk7MpruNdkWu/exec';
const fetchViaProxy = (url, { headers }) => {
  const _url = encodeURIComponent(url);
  const _jsonParams = encodeURIComponent(JSON.stringify({ headers }));
  const proxyUrl = `${PROXY_BASE_URL}?url=${_url}&jsonParams=${_jsonParams}`;
  return fetch(proxyUrl);
}

export const getYoutubeSubtitleInfo = (id) =>
  fetchViaProxy(`https://www.youtube.com/watch?v=${id}`, { headers: { 'Accept-Language': 'en-US,en' } })
  .then(resp => resp.text())
  .then(extractSubtitleInfo);

export const getEntries = async (subtitleUrl1, subtitleUrl2) => {
  const resps = await Promise.all([subtitleUrl1, subtitleUrl2].map(url => fetch(url)));
  if (!resps.every(r => r.ok)) {
    throw new Error('Subtitle not found');
  }
  const [ttml1, ttml2] = await Promise.all(resps.map(r => r.text()));
  return createEntries(ttml1, ttml2);
}

// Do all the steps together
export const getPlayerDataFromUrl = async (url, lang1, lang2) => {
  const videoId = parseVideoId(url);
  if (!videoId) {
    throw new Error('Unsupported URL');
  }
  let subtitleInfo;
  try {
    subtitleInfo = await getYoutubeSubtitleInfo(videoId);
  } catch (e) {
    console.error(e.message);
    throw new Error('Unsupported Video');
  }
  const { subtitleUrl1, subtitleUrl2 } = findPreferredSubtitles(subtitleInfo, lang1, lang2);
  let entries;
  try {
    entries = await getEntries(subtitleUrl1, subtitleUrl2);
  } catch (e) {
    throw new Error('Failed to load subtitles');
  }
  return { videoId, entries, subtitleInfo, subtitleUrl1, subtitleUrl2 };
}

export const createEntries = (ttml1, ttml2) => {
  const entries1 = ttmlToEntries(ttml1);
  const entries2 = ttmlToEntries(ttml2);
  let entries = mergeEntries(entries1, entries2);

  entries = entries.map((entry) => ({
    // TODO: Not used
    id: Math.random(),
    deckId: 0,
    rates: [],
    ...entry
  }))
  return entries;
}

const ttmlToEntries = (ttml) => {
  const doc = (new DOMParser()).parseFromString(ttml, 'text/xml');
  // NOTE: Handle subtitle containing "<p ...> ... <br /> ... </p>"
  Array.from(doc.getElementsByTagName('br')).forEach(br => br.replaceWith(' '));
  const ps = Array.from(doc.getElementsByTagName('p'));
  return ps.map((p) => ({
    begin: timestampToSecond(p.getAttribute('begin')),
    end: timestampToSecond(p.getAttribute('end')),
    text: p.textContent,
  }));
}

const mergeEntries = (entries1, entries2) => {
  return entries1.map((e1) => {
    const e2 = _.find(entries2, { begin: e1.begin });
    return {
      begin: e1.begin,
      end:   e1.end,
      text1: e1.text,
      text2: e2 ? e2.text : '',
    };
  });
}

// e.g. 00:02:04.020 => 2 * 60 + 4 = 124
export const timestampToSecond = (t) => {
  const [h, m, s] = t.split(':').map(Number).map(Math.floor);
  return ((h * 60) + m) * 60 + s;
}

// e.g. 124 => 00:02:04
export const secondToTimestamp = (s) => {
  ASSERT(Number.isInteger(s), '"secondToTimestamp" expects integer');
  let m = Math.floor(s / 60);
  s = s % 60;
  let h = Math.floor(m / 60);
  m = m % 60;
  return sprintf("%02d:%02d:%02d", h, m, s)
}
