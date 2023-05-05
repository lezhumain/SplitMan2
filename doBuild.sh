#! /bin/bash

echo "api: ${1}${2}"
echo "$2" > api.tmp

VERSION="$(node -e 'var d = new Date(); console.log(`${d.getFullYear() - 2022}.${d.getMonth() + 1}.${d.getDay()}`)')"
echo "VERSION: $VERSION"

#exit 1
docker build --build-arg IP="$1" --build-arg API="$2" --build-arg VERSION="$VERSION" -t splitman2 .
