mkdir build

browserify  -r ./lib/index.js:global-input-message > lib/global-input-message.js
ssh root@globalinput.co.uk 'mkdir global-input-node/nginx/data/websites/globalinput/lib'
scp build/global-input-message.js root@globalinput.co.uk:global-input-node/nginx/data/websites/globalinput/lib
