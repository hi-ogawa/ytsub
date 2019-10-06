import _ from 'lodash';
import { sprintf } from 'sprintf-js';
import { interval } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

//
// Misc utility
//

export const ASSERT = (bool, message) => bool || window.alert(message)

export const stopProp = (f) => (e) => {
  e.stopPropagation();
  return f(e);
}

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
}

//
// Parsing subtitle data
//

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
