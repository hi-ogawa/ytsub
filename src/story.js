import React, { useState, useEffect } from 'react';
import CN from 'classnames';
import { storiesOf } from '@storybook/react';
import localforage from 'localforage';

//
// Support async storyFn (I thought I need it but not used now)
//
// Usage:
//   storiesOf('Some Component', module)
//   .addDecorator((storyFn) => <AsyncStoryFnWrapper storyFn={storyFn} />)
//
const AsyncStoryFnWrapper = ({ storyFn }) => {
  const [children, setChildren] = useState(null);
  useEffect(() => {
    const story = storyFn();
    if (story instanceof Promise) {
      story.then(
        setChildren,
        (e) => { setChildren('storyFn failed.'); window.alert(e.message); }
      );
    } else {
      setChildren(story);
    }
  }, []);
  return <>{ children || 'Loading...' }</>;
}

//
// Root
//
import 'style-loader!css-loader!sass-loader!./scss/index.scss'
import Root from './components/Root.js';
import { createEntries } from './utils.js';

storiesOf('Root', module)
.add('Default', () => {
  return <Root />;
})
.add('Empty', () => {
  const storyFn = async () => {
    await localforage.clear();
    return <Root />;
  };
  return <AsyncStoryFnWrapper storyFn={storyFn} />;
})
.add('From WebShare', () => {
  // NOTE: Replaced state won't be cleared when story is changed,
  // so it needs to manually refresh browser if you go "Root > Default" story.
  const sharedUrl = 'https://www.youtube.com/watch?v=VsPE2ByYYyg';
  window.history.replaceState(
      {},
      window.document.title,
      window.location.href + `&share_target_text=${encodeURIComponent(sharedUrl)}`);
  return <Root />;
});

//
// App
//
import App from './components/App.js';

storiesOf('App', module)
.add('With Data', () => {
  const ttml1 = require('raw-loader!./fixtures/ru.ttml').default;
  const ttml2 = require('raw-loader!./fixtures/en.ttml').default;
  // cf. https://www.youtube.com/watch?v=VsPE2ByYYyg
  const videoId = 'VsPE2ByYYyg';
  const entries = createEntries(ttml1, ttml2);
  const props = {
    videoId,
    entries,
    actions: { setModal: () => {} }
  };
  return <App {...props} />;
})
.add('Empty', () => {
  const videoId = null;
  const entries = [];
  const props = {
    videoId,
    entries,
    actions: { setModal: () => {} }
  };
  return <App {...props} />;
});

//
// NewVideoForm
//
import NewVideoForm from './components/NewVideoForm.js';

storiesOf('NewVideoForm', module)
.add('Default', () => {
  const props = {
    defaultVideoId: null,
    actions: { setPlayerData: console.log },
  };
  return <NewVideoForm {...props} />;
})
.add('With Data', () => {
  // cf. https://www.youtube.com/watch?v=bVlFUcVNErs
  const videoId = 'bVlFUcVNErs'
  const props = {
    defaultVideoId: videoId,
    actions: { setPlayerData: console.log },
  };
  return <NewVideoForm {...props} />;
});


//
// @spinner example
//
storiesOf('@spinner-container', module)
.add('Default', () => {
  const C = () => {
    const [loading, setLoading] = useState(false);
    return (
      <div className='spinner-container-mixin-test'>
        <button className={CN({ loading })} onClick={() => setLoading(!loading)}>
          <span>SUBMIT</span>
        </button>
      </div>
    );
  }
  return <C />;
});

//
// useLoader + @spinner-container example
//
import { useLoader } from './utils.js';

storiesOf('useLoader', module)
.add('Default', () => {
  const C = () => {
    const doSomething = () => new Promise(r => window.setTimeout(r, 1000));
    const [ _doSomething, { loading } ] = useLoader(doSomething);
    return (
      <div className='spinner-container-mixin-test'>
        <button className={CN({ loading })} onClick={_doSomething}>
          <span>SUBMIT</span>
        </button>
      </div>
    );
  }
  return <C />;
});
