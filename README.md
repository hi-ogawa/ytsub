Youtube Subtitles Viewer

https://ytsub.hiogawa.now.sh

TODO

- Language preference
- History
- Ankitube (deck, rate, etc...)
- Scroll subtitle panel to follow video

Tips

```
# Development
yarn install
npm run storybook # then play with "App > With Data"

# Deployment
npm run build:deploy

# Running src/utils.js from NodeJS console (e.g. getYoutubeSubtitleInfo)
npm run node-utils
node --experimental-repl-await
> global.fetch = require('node-fetch')
> const utils = require('./src/utils.node.js')
> await utils.getYoutubeSubtitleInfo('bVlFUcVNErs')
```

References

- https://jsdoc.app/tags-type.html
- https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html
- https://developers.google.com/youtube/iframe_api_reference
- https://github.com/hi-ogawa/apps-script-proxy
