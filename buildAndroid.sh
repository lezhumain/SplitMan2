#! /bin/bash

set -e

WORKDIR="$(pwd)"

docker build -t splitman2androidbase -f Dockerfile_android .
docker build -t splitman2android -f Dockerfile_android1 .
id=$(docker create splitman2android)
docker cp $id:/app/apks/splitman2.apk - > ./splitman2.apk
docker rm -v $id

APK_FOLDER="./apks/"
if [ -d "$APK_FOLDER" ]; then
  rm -r "$APK_FOLDER"
fi

mkdir "$APK_FOLDER"

mv splitman2.apk "$APK_FOLDER"
if [[ "$(uname -a)" == *"Linux"* ]]; then
  md5sum "$APK_FOLDER/splitman2.apk" > "$APK_FOLDER/checksum.md5"
else
  md5sum.exe "$APK_FOLDER/splitman2.apk" > "$APK_FOLDER/checksum.md5"
fi

ls -alh "$APK_FOLDER"
