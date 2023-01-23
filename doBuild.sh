#! /bin/bash

echo "api: ${1}${2}"
echo "$2" > api.tmp
#exit 1
docker build --build-arg IP="$1" --build-arg API="$2" -t splitman2 .
