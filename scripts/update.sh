#!/bin/bash

set -e

cd ~/bat-ui
git pull
npm i
npm run build
reboot
