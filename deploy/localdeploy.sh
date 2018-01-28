
#mkdir ../global-input-web/src/global-input-message
#cp src/index.js ../global-input-web/src/global-input-message/

mkdir ../globalInputMobile/app/global-input-message
rsync -azvv src/ ../globalInputMobile/app/global-input-message/
#cp src/index.js ../globalInputMobile/node_modules/global-input-message/
