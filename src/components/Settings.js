import React from "react";

import { useGetSelector, useActions } from "../stateDef.js";
import translationLanguages from "../fixtures/translationLanguages.json";

const Settings = () => {
  const { lang1, lang2 } = useGetSelector("userData.preference");
  const { update } = useActions();
  const mergePreference = (next) => {
    update({ userData: { preference: { $merge: next } } });
  };

  return (
    <div id="settings-container">
      <h1>Settings</h1>

      <div className="language-select">
        <label>Default Languages</label>
        <select
          value={lang1 || "default"}
          onChange={(e) => mergePreference({ lang1: e.target.value })}
        >
          <option value="default" disabled>
            -- 1st Language --
          </option>
          {translationLanguages.map(
            ({ languageCode, languageName: { simpleText } }) => (
              <option key={languageCode} value={languageCode}>
                {simpleText}
              </option>
            )
          )}
        </select>

        <select
          value={lang2 || "default"}
          onChange={(e) => mergePreference({ lang2: e.target.value })}
        >
          <option value="default" disabled>
            -- 2nd Language --
          </option>
          {translationLanguages.map(
            ({ languageCode, languageName: { simpleText } }) => (
              <option key={languageCode} value={languageCode}>
                {simpleText}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
};

export default Settings;
