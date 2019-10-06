TODO

- WebShare target
- AnkiTube feature
  - deck, rate
- More Interaction
  - scroll subtitle to follow video

Tips

```
# Development
yarn install
yarn run storybook # then play with "App > With Data"

# Running src/utils.js from Node Console (e.g. getYoutubeSubtitleInfo)
yarn run node-utils
node --experimental-repl-await
> global.fetch = require('node-fetch')
> const utils = require('./src/utils.node.js')
> await utils.getYoutubeSubtitleInfo('bVlFUcVNErs')
```

References

- https://jsdoc.app/tags-type.html
- https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html
- https://developers.google.com/youtube/iframe_api_reference
