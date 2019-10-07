import React from 'react';
import ReactDOM from 'react-dom';

import 'style-loader!css-loader!sass-loader!./scss/index.scss';
import Root from './components/Root.js';
import registerServiceWorker from './registerServiceWorker';

const Main = () => {
  registerServiceWorker();
  ReactDOM.render(<Root />, document.getElementById('root'));
}

Main();
