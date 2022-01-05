#! /bin/bash

MACHINE_INFO="$(uname -a)"
if [[ $MACHINE_INFO == *"MINGW"* ]]; then
  taskkill -IM "chrome.exe" -F -T
fi
