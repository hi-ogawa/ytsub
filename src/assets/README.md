Generate icons

```
curl https://fonts.gstatic.com/s/i/materialicons/subtitles/v1/24px.svg > original.svg
sed 's/width="24"/width="512"/' original.svg | sed 's/height="24"/height="512"/' > original-512.svg
for px in 32 192 512; do convert -resize "${px}x${px}" -background none original-512.svg "icon-${px}.png"; done
```
