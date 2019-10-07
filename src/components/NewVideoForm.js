import React, { useState, useEffect } from 'react';
import CN from 'classnames';
import { parseVideoId, getYoutubeSubtitleInfo, findPreferredSubtitles, getEntries,
         useLoader, useUpdate } from '../utils.js';

const NewVideoForm = ({
  actions,
  defaultVideoId,
  preference = { lang1: 'ru', lang2: 'en' }, // TODO: Implement preference system
}) => {
  const [state, _, __, mergeState] = useUpdate({
    videoId: defaultVideoId || '',
    subtitleInfo: { tracks: [], translations: [] },
    subtitleUrl1: '',
    subtitleUrl2: ''
  });

  const [_getYoutubeSubtitleInfo, { loading: loading1 }] = useLoader(getYoutubeSubtitleInfo)
  const [_getEntries, { loading: loading2 }] = useLoader(getEntries)

  const videoInputHandler = async () => {
    const videoId = parseVideoId(state.videoId);
    if (!videoId) {
      window.alert('Unsupported input');
      return false;
    } else {
      const { value: subtitleInfo, state: { error } } = await _getYoutubeSubtitleInfo(videoId)
      if (error) {
        console.error(e.message);
        window.alert('Unsupported video');
        return false;
      }
      const { subtitleUrl1, subtitleUrl2 } =
          findPreferredSubtitles(subtitleInfo, preference.lang1, preference.lang2);
      mergeState({ videoId, subtitleInfo, subtitleUrl1, subtitleUrl2 });
    }
    return true;
  }

  const playHandler = async () => {
    const { value: entries, state: { error } } = await _getEntries(state.subtitleUrl1, state.subtitleUrl2);
    if (error) {
      console.error(e.message);
      return window.alert('Failed to load subtitles');
    }
    actions.update({ $merge:
      {
        playerData: {
          entries,
          ...state
        },
        modal: null
      }
    });
  }

  return (
    <div id='new-video-form-container'>
      <h1>Load Video</h1>
      <div className='video-input'>
        <label>Youtube Video</label>
        <div className='input-grp'>
          <input value={state.videoId} onChange={(e) => mergeState({ videoId: e.target.value })} placeholder='URL or ID'/>
          <button onClick={videoInputHandler} className={CN({ loading: loading1 })}>
            <i className="material-icons">search</i>
          </button>
        </div>
      </div>

      <div className='language-select'>
        <label>Languages</label>
        <select
          value={state.subtitleUrl1 || 'default'}
          onChange={(e) => mergeState({ subtitleUrl1: e.target.value })}
          disabled={state.subtitleInfo.tracks.length == 0}
        >
          <option value='default' disabled>-- 1st Language --</option>
          {
            state.subtitleInfo.tracks.map(t =>
              <option key={t.url} value={t.url}>{t.name}</option>)
          }
          {
            state.subtitleInfo.tracks.map(t =>
              <optgroup key={t.url} label={`-- Auto-translations from ${t.name}`}>
                {
                  state.subtitleInfo.translations.map(tr =>
                    <option key={tr.code} value={`${t.url}&tlang=${tr.code}`}>{tr.name}</option>)
                }
              </optgroup>)
          }
        </select>

        <select
          value={state.subtitleUrl2 || 'default'}
          onChange={(e) => mergeState({ subtitleUrl2: e.target.value })}
          disabled={state.subtitleInfo.tracks.length == 0}
        >
          <option value='default' disabled>-- 2nd Language --</option>
          {
            state.subtitleInfo.tracks.map(t =>
              <option key={t.url} value={t.url}>{t.name}</option>)
          }
          {
            state.subtitleInfo.tracks.map(t =>
              <optgroup key={t.url} label={`-- Auto-translations from ${t.name}`}>
                {
                  state.subtitleInfo.translations.map(tr =>
                    <option key={tr.code} value={`${t.url}&tlang=${tr.code}`}>{tr.name}</option>)
                }
              </optgroup>)
          }
        </select>
      </div>

      <div className='play-action'>
        <button
          onClick={playHandler}
          disabled={!(state.videoId && state.subtitleUrl1 && state.subtitleUrl2)}
          className={CN({ loading: loading2 })}
        >
          <span>PLAY</span>
          <i className="material-icons">play_arrow</i>
        </button>
      </div>
    </div>
  );
}

export default NewVideoForm;
