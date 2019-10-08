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

// TODO: use this for restoring messed up URL by "Root > From WebShare"
const OnLeaveWrapper = ({ onLeave, render }) => {
  useEffect(() => onLeave, []);
  return render();
}

//
// stateDef.js
//
import { createProvider, useActions, useGetSelector, useRootState } from './stateDef.js';

// helpers
const mkProviderDecorator = (options = {}) => (storyFn) => {
  const Provider = createProvider(options);
  return <Provider>{storyFn()}</Provider>;
}

storiesOf('stateDef', module)
.addDecorator(mkProviderDecorator())
.add('createProvider', () => <div>I'm inside of Provider</div>)
.add('useRootState', () => {
  const C = () => {
    const state = useRootState();
    return <pre>{JSON.stringify(state, null, 2)}</pre>;
  };
  return <C />;
})
.add('useActions + useGetSelector', () => {
  const C = () => {
    const counter = useGetSelector('counter');
    const { update } = useActions();
    const handler = () => update({ counter: { $set: counter ? counter + 1 : 1 } });
    return (
      <div>
        <button onClick={handler}>Click</button>
        <pre>counter: {counter}</pre>
      </div>
    );
  };
  return <C />;
})

//
// Root
//
import 'style-loader!css-loader!sass-loader!./scss/index.scss'
import Root from './components/Root.js';
import { createEntries } from './utils.js';

storiesOf('Root', module)
.add('Default', () => {
  return mkProviderDecorator({ storage: true })(() => <Root />);
})
.add('Clear Storage', () => {
  const storyFn = async () => {
    await localforage.clear();
    return mkProviderDecorator({ storage: true })(() => <Root />);
  };
  return <AsyncStoryFnWrapper storyFn={storyFn} />;
})
.add('From WebShare', () => {
  // NOTE: Replaced state won't be cleared when story is changed,
  // so it needs to manually refresh browser if you go "Root > Default" story.
  const sharedUrl = 'https://www.youtube.com/watch?v=VsPE2ByYYyg';
  const nextUrl = window.location.href + `&share_target_text=${encodeURIComponent(sharedUrl)}`;
  window.history.replaceState({}, '', nextUrl);
  return mkProviderDecorator({ storage: true })(() => <Root />);
});

//
// App
//
import App from './components/App.js';

storiesOf('App', module)
.add('With Data', () => {
  const ttml1 = require('raw-loader!./fixtures/ru.ttml').default;
  const ttml2 = require('raw-loader!./fixtures/en.ttml').default;
  const videoId = 'VsPE2ByYYyg'; // cf. https://www.youtube.com/watch?v=VsPE2ByYYyg
  const entries = createEntries(ttml1, ttml2);
  const initialCommand = {
    playerData: { $set: { videoId, entries } },
    userData: { $merge: { preference: { lang1: 'ru', lang2: 'en' } } }
  }
  return mkProviderDecorator({ initialCommand })(() => <App />);
})
.add('Default', () => {
  return mkProviderDecorator()(() => <App />);
});

//
// NewVideoForm
//
import NewVideoForm from './components/NewVideoForm.js';

storiesOf('NewVideoForm', module)
.addDecorator(mkProviderDecorator())
.add('Empty', () => {
  const props = {
    defaultVideoId: null,
  };
  return <NewVideoForm {...props} />;
})
.add('With defaultVideoId', () => {
  const props = {
    defaultVideoId: 'bVlFUcVNErs', // cf. https://www.youtube.com/watch?v=bVlFUcVNErs
  };
  return <NewVideoForm {...props} />;
});

//
// LanguageSelectForm
//
import LanguageSelectForm from './components/LanguageSelectForm.js';
import { findPreferredSubtitles } from './utils.js';

storiesOf(LanguageSelectForm.name, module)
.add('With Data', () => {
  // NOTE: this data is old one so the subtitle urls are invalid now.
  const subtitleInfo = require('./fixtures/subtitleInfo.json');
  const { subtitleUrl1, subtitleUrl2 } = findPreferredSubtitles(subtitleInfo, 'ru', 'de');
  const initialCommand = {
    playerData: { $merge: { subtitleInfo, subtitleUrl1, subtitleUrl2 } }
  }
  return mkProviderDecorator({ initialCommand })(() => <LanguageSelectForm />);
});

//
// Settings
//
import Settings from './components/Settings.js';

storiesOf(Settings.name, module)
.addDecorator(mkProviderDecorator({ initialCommand: {
  userData: { preference: { $set: { lang1: 'ru', lang2: 'de' } }}
}}))
.add('Default', () => {
  return <Settings />;
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
