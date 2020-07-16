# MAIN APP INSTALLATION
npm i &&
npm run build &&

# MAIN APP AUTOSTART
sudo mkdir /usr/share/bat
sudo cp -rf dist/linux-armv7l-unpacked/** /usr/share/bat/
echo '/usr/share/bat/bat-ui' > ~/.xinitrc
chmod +x ~/.xinitrc

while read p; do sudo systemctl disable "$p"; done < unused-packages.list
