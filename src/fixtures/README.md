```
# Download subtitles
youtube-dl -o "example.%(ext)s" --skip-download --write-auto-sub --sub-lang=en,ru --sub-format=ttml https://www.youtube.com/watch?v=uIEw0hZfMos

# Download subtitleInfo example
npm run node-utils
node scripts.js uIEw0hZfMos > subtitleInfo.json
```
