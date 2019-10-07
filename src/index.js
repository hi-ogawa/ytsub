import React from 'react';
import ReactDOM from 'react-dom';

import 'style-loader!css-loader!sass-loader!./scss/index.scss';
import App from './components/App.js';

const Main = async () => {
  const props = {
    videoId: '',
    entries: [],
  }
  ReactDOM.render(<App {...props} />, document.getElementById('root'));
}

Main();
