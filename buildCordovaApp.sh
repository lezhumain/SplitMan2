#! /bin/bash

LIFEMAN="$(pwd)"
npm run build:prod

PROJ_NAME="$1"
if [ -z "$PROJ_NAME" ]; then
    PROJ_NAME="CordovaProject"
fi
PROJ_NAME_LOWER="$(echo "$PROJ_NAME" | tr '[:upper:]' '[:lower:]')"

rm -rf /tmp/cordova_react_test*
cp -f ./cordova_react_test.zip /tmp
cd /tmp
unzip ./cordova_react_test.zip

TARGET="/tmp/cordova_react_test"
if [ ! -d "$TARGET" ]; then
    echo "Folder cordova_react_test doesn't exist."
    exit 1
fi

pushd "$TARGET"
#ls -alh
#npx cordova run --warning-mode android

sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.xml
sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.json
sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.sh
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.xml
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.json
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.sh

if [ -d build ]; then
    rm -rf build/*
fi
cp -r "$LIFEMAN/dist/SplitMan21" ./build

export ANDROID_SDK_ROOT="/c/Program Files (x86)/Android/android-sdk"
export PATH="$PATH:/c/Gradle/gradle-7.6/bin"

#npm ci
./resetAndroid.sh
#npm run build
npm run build_cordova_android

popd


# TODO handle all of them
mkdir -p apks
TARGET_APK="$(find "$TARGET/platforms/" -name "*.apk" | head -n 1)"
cp "$TARGET_APK" ./apks/splitman2.apk

md5sum.exe ./apks/splitman2.apk > ./apks/checksum.md5
