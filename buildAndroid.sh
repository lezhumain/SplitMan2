#! /bin/bash

set -e

function doSign() {
  # sign apk
  if [ ! -f my-release-key.keystore ]; then
    keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
  fi

  #jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore "$APK_FOLDER/splitman2.apk" alias_name

  java -jar /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/lib/apksigner.jar sign --ks-key-alias alias_name --ks my-release-key.keystore apks/splitman2.apk
  java -jar /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/lib/apksigner.jar verify apks/splitman2.apk
  /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/zipalign.exe -c 4 apks/splitman2.apk # verify

  #/c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/zipalign.exe -p 4 apks/splitman2.apk apks/splitman2_aligned.apk # do align
  #java -jar /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/lib/apksigner.jar verify apks/splitman2_aligned.apk
  #/c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/zipalign.exe -c 4 apks/splitman2_aligned.apk # verify
}

WORKDIR="$(pwd)"

npm run build:prod

cd ../SplitMan2-cordova

cp -r "$WORKDIR/dist/SplitMan21"/* ./build/
cp -r "$WORKDIR/dist/SplitMan21"/* ./www/

docker build -t splitman2androidbase -f android_build/Dockerfile_android .
docker build -t splitman2android -f android_build/Dockerfile_android1 .

cd "$WORKDIR"

id=$(docker create splitman2android)
docker cp $id:/app/apks/splitman2.apk - > ./splitman2.tar
docker rm -v "$id"
tar -xf ./splitman2.tar


APK_FOLDER="./apks"
if [ -d "$APK_FOLDER" ]; then
  rm -r "$APK_FOLDER"
fi

mkdir "$APK_FOLDER"

mv splitman2.apk "$APK_FOLDER/"
cp "$APK_FOLDER/splitman2.apk" "$APK_FOLDER/splitman2_unsigned.apk"

doSign

if [[ "$(uname -a)" == *"Linux"* ]]; then
  md5sum "$APK_FOLDER"/*.apk > "$APK_FOLDER/checksum.md5"
else
  md5sum.exe "$APK_FOLDER"/*.apk > "$APK_FOLDER/checksum.md5"
fi

ls -alh "$APK_FOLDER"

cat "$APK_FOLDER/checksum.md5"

# java -jar /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/lib/apksigner.jar sign --ks-key-alias alias_name --ks my-release-key.keystore apks/splitman2.apk

# /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/zipalign.exe -p 4 apks/splitman2.apk apks/splitman2_aligned.apk
# java -jar /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/lib/apksigner.jar verify apks/splitman2.apk
# /c/Program\ Files\ \(x86\)/Android/android-sdk/build-tools/33.0.2/zipalign.exe -c 4 apks/splitman2.apk

