#! /bin/bash

docker build --build-arg IP="$1" --build-arg API="$2" -t splitman2 .
