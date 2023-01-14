#! /bin/bash

set -e

WORKING_DIR="$(pwd)"
HOST_IP="$1"
USE_HTTPS="$2"

if [ -z "$HOST_IP" ]; then
       # EXT ip
       #HOST_IP="$(curl -s https://api.myip.com | jq -r .ip)"
       # LOCAL ip
       HOST_IP="$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)"
fi

docker system prune -af

function update_dir()
{
        local BPATH="$1"
        local DPATH="$1/$2"
        local DNAME="$2"
        local DBRANCH="master"
        if [ -n "$3" ]; then
                DBRANCH="$3"
        fi

        #cd "$DPATH"
        if [ -z "$USE_HTTPS" ]; then
                if [ ! -d "$DPATH" ]; then
                        git clone "git@github.com:lezhumain/$DNAME.git" "$DPATH"
                fi
                cd "$DPATH"
                git stash
                git fetch
                git checkout "$DBRANCH"
                git pull
        else
                cd ..
                rm -rf "$DNAME" || true
                curl "https://codeload.github.com/lezhumain/$DNAME/zip/refs/heads/$DBRANCH" -o master.zip
                ls
                unzip master.zip
                ls
                TARGET_FOLDER="$DNAME-$(echo "$DBRANCH" | sed "s|/|-|g")"
                mv "$TARGET_FOLDER" "$DNAME"
                cd "$DNAME"
        fi
}

#export CERT_PATH="/c/Users/djuuu/example"
export MONGO_USER="SECRET_TODO"
export MONGO_PASS="SECRET_TODO"

sed -i.bak -E "s|MONGO_INITDB_ROOT_USERNAME=.+$|MONGO_INITDB_ROOT_USERNAME=$MONGO_USER|" docker-compose.yml
sed -i.bak -E "s|MONGO_INITDB_ROOT_PASSWORD=.+$|MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASS|" docker-compose.yml

update_dir ".." "SplitMan2-nginx" "main"
#cd ../SplitMan2-nginx
bash doBuild.sh "http://$HOST_IP" # nginx

update_dir ".." "SplitMan2-API" "master"
#cd ../SplitMan2-API
bash doBuild.sh "https://$HOST_IP:8081" # api

update_dir ".." "SplitMan2" "master"
#cd ../SplitMan2
bash doBuild.sh "https://$HOST_IP:8081" "/api" # web

docker images
