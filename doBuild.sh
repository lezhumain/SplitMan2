#! /bin/bash

echo "api: ${1}${2}"
#exit 1
docker build --build-arg IP="$1" --build-arg API="$2" -t splitman2 .
