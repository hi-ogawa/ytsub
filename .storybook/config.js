import { configure } from '@storybook/react';

const loaderFn = () => {
  require('../src/story.js');
}

configure(loaderFn, module);
