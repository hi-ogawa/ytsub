import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '@storybook/react/demo';

//
// Just keep tutorial example here
//
const wrapButton = storyFn => (
  <div id="story-root">{storyFn()}</div>
)
storiesOf('Button', module)
.addDecorator(wrapButton)
.add('With Text', () => <Button>Hello Button</Button>)
.add('With Emoji', () => <Button><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>)


//
// App
//

import 'style-loader!css-loader!sass-loader!./scss/index.scss'
import App from './components/app.js';

import { createEntries } from './utils.js';
import ttml1 from 'raw-loader!./fixtures/ru.ttml';
import ttml2 from 'raw-loader!./fixtures/en.ttml';

storiesOf('App', module)
.add('Default', () => {
  const props = {
    videoId: 'VsPE2ByYYyg',
    entries: createEntries(ttml1, ttml2),
  };
  return <App {...props} />;
});
