```
# Download subtitles
youtube-dl -o "example.%(ext)s" --skip-download --write-auto-sub --sub-lang=en,ru --sub-format=ttml https://www.youtube.com/watch?v=uIEw0hZfMos

# Download youtube video page
curl -H 'accept-language: en' https://www.youtube.com/watch?v=uIEw0hZfMos > example.html

# Parse "player response" data
python -c 'import re; print(re.search("var ytInitialPlayerResponse = ({.+?});", open("example.html").read()).group(1))' > playerResponse.json

# Download translation language list
jq '.captions.playerCaptionsTracklistRenderer.translationLanguages' playerResponse.json > translationLanguages.json
```
