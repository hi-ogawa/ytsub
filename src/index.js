import React from 'react';
import ReactDOM from 'react-dom';

import 'style-loader!css-loader!sass-loader!./scss/index.scss';
import Root from './components/Root.js';

const Main = () => {
  ReactDOM.render(<Root />, document.getElementById('root'));
}

Main();
