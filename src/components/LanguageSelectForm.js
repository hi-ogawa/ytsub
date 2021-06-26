import React from "react";
import CN from "classnames";

import { useGetSelector, useActions } from "../stateDef.js";
import { getEntries, useLoader, useUpdate } from "../utils.js";

const LanguageSelectForm = () => {
  const { update: updateRoot } = useActions();
  const { subtitleUrl1, subtitleUrl2, subtitleInfo } =
    useGetSelector("playerData");

  const [state, __, ___, mergeState] = useUpdate({
    subtitleInfo,
    subtitleUrl1,
    subtitleUrl2,
  });

  const [_getEntries, { loading }] = useLoader(getEntries);

  const updateHandler = async () => {
    const {
      value: entries,
      state: { error },
    } = await _getEntries(state.subtitleUrl1, state.subtitleUrl2);
    if (error) {
      console.error(error.message);
      return window.alert("Failed to load subtitles");
    }
    updateRoot({
      playerData: {
        $merge: {
          entries,
          subtitleUrl1: state.subtitleUrl1,
          subtitleUrl2: state.subtitleUrl2,
        },
      },
      modal: { $set: null },
    });
  };

  return (
    <div id="language-select-form-container">
      <h1>Select Language</h1>
      {/* Mostly Copy&Paste from NewVideoForm.js */}
      <div className="language-select">
        <label>Languages</label>
        <select
          value={state.subtitleUrl1 || "default"}
          onChange={(e) => mergeState({ subtitleUrl1: e.target.value })}
          disabled={state.subtitleInfo.tracks.length == 0}
        >
          <option value="default" disabled>
            -- 1st Language --
          </option>
          {state.subtitleInfo.tracks.map((t) => (
            <option key={t.url} value={t.url}>
              {t.name}
            </option>
          ))}
          {state.subtitleInfo.tracks.map((t) => (
            <optgroup key={t.url} label={`-- Auto-translations from ${t.name}`}>
              {state.subtitleInfo.translations.map((tr) => (
                <option key={tr.code} value={`${t.url}&tlang=${tr.code}`}>
                  {tr.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          value={state.subtitleUrl2 || "default"}
          onChange={(e) => mergeState({ subtitleUrl2: e.target.value })}
          disabled={state.subtitleInfo.tracks.length == 0}
        >
          <option value="default" disabled>
            -- 2nd Language --
          </option>
          {state.subtitleInfo.tracks.map((t) => (
            <option key={t.url} value={t.url}>
              {t.name}
            </option>
          ))}
          {state.subtitleInfo.tracks.map((t) => (
            <optgroup key={t.url} label={`-- Auto-translations from ${t.name}`}>
              {state.subtitleInfo.translations.map((tr) => (
                <option key={tr.code} value={`${t.url}&tlang=${tr.code}`}>
                  {tr.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="action">
        <button
          disabled={!(state.subtitleUrl1 && state.subtitleUrl2)}
          onClick={updateHandler}
          className={CN({ loading })}
        >
          <span>UPDATE</span>
          <i className="material-icons">done</i>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelectForm;
