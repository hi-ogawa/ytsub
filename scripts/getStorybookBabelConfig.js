// Dump bable config
// $ node -e "console.dir(require('./scripts/getStorybookBabelConfig.js')(), { depth: null })"

module.exports = () => {
  const gen1 = require('@storybook/core/dist/server/common/babel.js').default;
  const gen2 = require('@storybook/react/dist/server/framework-preset-react.js').babelDefault;

  const configType = 'PRODUCTION';
  const config = gen2(gen1({ configType }));

  return config;
};
