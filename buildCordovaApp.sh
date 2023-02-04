#! /bin/bash

TARGET="../cordova_react/cordova_react_test"
if [ ! -d "$TARGET" ]; then
    echo "Folder cordova_react_test doesn't exist."
    exit 1
fi

pushd "$TARGET"
ls -alh
#npx cordova run --warning-mode android
./buildSplitMan2.sh
popd

# TODO handle all of them
mkdir -p apks
TARGET_APK="$(find "$TARGET/platforms/" -name "*.apk" | head -n 1)"
cp "$TARGET_APK" ./apks/splitman2.apk

md5sum.exe ./apks/splitman2.apk > ./apks/checksum.md5
