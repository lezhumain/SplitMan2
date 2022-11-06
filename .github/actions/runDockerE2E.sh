#! /bin/bash

set -e

node -v
npm -v
#exit 1

echo Add other tasks to build, test, and deploy your project.
echo See https://aka.ms/yaml
CURRENT="$(pwd)"

#git clone git@github.com:lezhumain/SplitMan2-API.git
#git clone git@github.com:lezhumain/SplitMan2-nginx.git
#cd "$CURRENT"
HOST_IP="127.0.0.1"
USE_HTTPS="USE"

# buid all
function update_dir()
{
    local DPATH="$1/$2"
    local DNAME="$2"
    local DBRANCH="master"
    if [ -n "$3" ]; then
        DBRANCH="$3"
    fi

    cd "$DPATH"
    if [ -z "$USE_HTTPS" ]; then
        git stash
        git checkout master
        git pull
    else
        cd ..
        rm -rf "$DNAME" || true
        curl "https://codeload.github.com/lezhumain/$DNAME/zip/refs/heads/$DBRANCH" -o master.zip
        ls
        unzip master.zip
        ls
        mv "$DNAME-$DBRANCH" "$DNAME"
        cd "$DNAME"
    fi
}

# bash doBuild.sh "https://$HOST_IP:8081" "/api" # web

export CERT_PATH="~/.ssl/example"
echo "11"
sudo ls -d "$CERT_PATH".*
echo "22"
ls -al "/home/$(whoami)/.ssl"

ls -al
pwd

update_dir ".." "SplitMan2-nginx" "main"
bash doBuild.sh "http://$HOST_IP" # nginx

exit 0

update_dir ".." "SplitMan2-API"
bash doBuild.sh "https://$HOST_IP:8081" # api

cd "$CURRENT"
#ls
#pwd

docker images

#docker-compose up -d
#if [ "$?" != "0" ]; then
#  exit 1
#fi

#sleep 40
#WEB_UP="$(curl -s "$HOST_IP:4200/login")"
##while [ -z "$WEB_UP" ]
##do
##  sleep 2
##  WEB_UP="$(curl -s "$HOST_IP:4200/login")"
##done
#if [ -z "$WEB_UP" ]; then
#  exit 1
#fi

#npm ci
#npm run e2e -- --headless=true
