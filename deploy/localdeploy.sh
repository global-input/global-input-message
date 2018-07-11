#mkdir ../globalInputMobile/app/global-input-message
#rsync -azvv distribution/ ../globalInputMobile/app/global-input-message/
#rsync -azvv src/ ../globalInputMobile/app/global-input-message/

mkdir ../global-input-web/app/global-input-message/src
#rsync -azvv distribution/ ../global-input-web/src/global-input-message/
rsync -azvv src/ ../global-input-web/src/global-input-message/

#mkdir ~/box/image-client-app/src/global-input-messafe
#rsync -azvv src/ ~/box/image-client-app/src/global-input-message/
