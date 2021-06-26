import React, { useEffect, useRef } from "react";
import CN from "classnames";
import _ from "lodash";

import App from "./App.js";
import Modal from "./Modal.js";
import NewVideoForm from "./NewVideoForm.js";
import { useGetSelector, useActions } from "../stateDef.js";
import { useLoader, getPlayerDataFromUrl } from "../utils.js";

//
// Dom tree
// - #root     (<- from index.html)
//   - #modal
//   - #app
//
const Root = () => {
  const loadingStorage = useGetSelector("loadingStorage");
  const { lang1, lang2 } = useGetSelector("userData.preference");
  const { merge, setModal } = useActions();
  const callOnce = useRef(false);
  const [_getPlayerDataFromUrl, { loading: loadingSharedUrl }] =
    useLoader(getPlayerDataFromUrl);

  useEffect(() => {
    // Call once after loadingStorage finished
    if (!loadingStorage && !callOnce.current) {
      callOnce.current = true;
      (async () => {
        // If user landed from WebShare, then automatically load its referencing video.
        // Otherwise, prompt NewVideoForm.
        const sharedUrl = new URL(window.location).searchParams.get(
          "share_target_text"
        );
        if (sharedUrl) {
          const {
            value,
            state: { error },
          } = await _getPlayerDataFromUrl(sharedUrl, lang1, lang2);
          if (error) {
            console.error(error);
            window.alert("Failed to load video");
          } else {
            merge({ playerData: value });
          }
        } else {
          setModal(<NewVideoForm {...{ defaultVideoId: null }} />);
        }
      })();
    }
  }, [loadingStorage]);

  return (
    <>
      <div
        id="root-spinner"
        className={CN({ loading: loadingStorage || loadingSharedUrl })}
      />
      <Modal />
      <App />
    </>
  );
};

export default Root;
