#! /bin/bash

set -e

if [ -z "$ANDROID_HOME"  ] || [[ "$PATH" != *"radle"* ]]; then
  echo "Need to export ANDROID_HOME and add gradle to PATH"
  exit 1
fi


LIFEMAN="$(pwd)"
PROJ_NAME="$1"
if [ -z "$PROJ_NAME" ]; then
    PROJ_NAME="CordovaProject"
fi
PROJ_NAME_LOWER="$(echo "$PROJ_NAME" | tr '[:upper:]' '[:lower:]')"

#npm ci --force
#echo 1
#npm run cp-libs
#echo 2
#npx ng build --configuration production
#echo 3


#rm -rf /tmp/cordova_react_test*
#cp -f ./cordova_react_test.zip /tmp
cd /tmp
unzip "$LIFEMAN"/cordova_react_test.zip > /dev/null

TARGET="/tmp/cordova_react_test"
if [ ! -d "$TARGET" ]; then
    echo "Folder cordova_react_test doesn't exist."
    exit 1
fi

pushd "$TARGET"

sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.xml
sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.json
sed -i"" "s|SplitMan2|$PROJ_NAME|g" ./*.sh
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.xml
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.json
sed -i"" "s|splitman2|$PROJ_NAME_LOWER|g" ./*.sh

if [ -d build ]; then
    rm -rf build/*
fi
if [ ! -d "$LIFEMAN/dist/SplitMan21" ]; then
  echo "Couldn't find \"$LIFEMAN/dist/SplitMan21\""
  exit 1
fi
cp -r "$LIFEMAN/dist/SplitMan21" ./build

if [ ! -d build ]; then
  echo "Couldn't find \"build\""
  exit 1
fi
echo "here: $(pwd)"
ls -ald build

#export ANDROID_SDK_ROOT="/usr/local/lib/android/sdk"
#export ANDROID_SDK_ROOT="/c/Program Files (x86)/Android/android-sdk"
#if [[ "$PATH" != *"radle"* ]]; then
#  echo "Adding gradle to path"
#  export PATH="$PATH:/c/Gradle/gradle-7.6/bin"
#fi

chmod +x ./resetAndroid.sh
echo "resetting android"
./resetAndroid.sh > /dev/null
echo "reset android done"

cp -r "$LIFEMAN/dist/SplitMan21" ./build

if [ ! -d build ]; then
  echo "Couldn't find \"build\""
  exit 1
fi

#npm run build
pwd
ls -ald build
#npm run build_cordova_android
echo "running run_cordova_android"
npm run build_cordova_android
echo "run_cordova_android done"
popd

# TODO handle all of them
APK_FOLDER="$LIFEMAN/apks"

mkdir -p "$APK_FOLDER"
TARGET_APK="$(find "$TARGET/platforms/" -name "*.apk" | head -n 1)"
if [ -z "$TARGET_APK" ]; then
  echo "No APK found"
  exit 1
fi
cp -v "$TARGET_APK" "$APK_FOLDER/splitman2.apk"

if [[ "$(uname -a)" == *"Linux"* ]]; then
  md5sum "$APK_FOLDER/splitman2.apk" > "$APK_FOLDER/checksum.md5"
else
  md5sum.exe "$APK_FOLDER/splitman2.apk" > "$APK_FOLDER/checksum.md5"
fi

ls -alh "$APK_FOLDER"
