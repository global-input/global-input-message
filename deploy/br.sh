mkdir build

browserify  -r ./lib/index.js:global-input-message > build/global-input-message.js
ssh root@globalinput.co.uk 'mkdir /data/websites/iterativesolution/nginx/data/websites/globalinput/lib'
scp build/global-input-message.js root@globalinput.co.uk:/data/websites/iterativesolution/nginx/data/websites/globalinput/lib
