#! /bin/bash

echo "api: ${1}${2}"
echo "$2" > api.tmp

VERSION="$(node -e 'var d = new Date(); console.log(`${d.getFullYear() - 2022}.${d.getMonth() + 1}.${d.getDay()}`)')"
echo "VERSION: $VERSION"

if [ -f "$SSH_KEY" ]; then
  echo "getting key in temp folder"
#  sudo cp "$SSH_KEY" ./id_rsa
  cp "$SSH_KEY" ./id_rsa
fi

if [ ! -f ./id_rsa ]; then
  echo "Need rsa key (to get github dependencies)"
  exit 1
fi

npm ci --force && npm run cp-libs # TODO remove me when using npm packages for splitwise repart

#exit 1
docker build --build-arg IP="$1" --build-arg API="$2" --build-arg VERSION="$VERSION" -t splitman2 .
