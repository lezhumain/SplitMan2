#! /bin/bash

set -e

##mkdir -p "$HOME/.ssh"
##mkdir -p "/root/.ssh"
##
##ssh-keyscan -t rsa github.com >> "/etc/ssh/known_hosts"
##
##cp /etc/ssh/known_hosts /root/.ssh/known_hosts
##cp /etc/ssh/known_hosts $HOME/.ssh/known_hosts
##
##eval `ssh-agent -s`
##ssh-add - <<< "$INPUT_SSHKEY"
#
#if [ -z "$INPUT_VERSION" ]; then
#  echo "Missing INPUT_VERSION"
#  exit 1
#fi
#
#echo "Version: $INPUT_VERSION"
#
#sed "s/0.0.0/$INPUT_VERSION/" package.json > package.json.new
#mv package.json package.json.old
#mv package.json.new package.json
#
#ENV_FILE="src/environments/environment.prod.ts"
#sed "s/PROD_IP/$INPUT_EXT_ADDR/g" "$ENV_FILE" > "$ENV_FILE.new"
#mv "$ENV_FILE" "$ENV_FILE.old"
#mv "$ENV_FILE.new" "$ENV_FILE"
#
#npm run build:prod
#
## TODO SSH key
#echo "Uploading APP..."
#scp -r dist/SplitMan21/* "pi@$INPUT_SSHSERVER:$INPUT_APPPATH"
#
#if [ ! -d "SplitMan2-API" ]; then
#  git clone git@github.com:lezhumain/SplitMan2-API.git
#fi
#
#cd SplitMan2-API
#git stash
#git checkout master
#git pull
#
#sed "s/http:\/\/127.0.0.1:4200/https:\/\/86.18.16.122:8083/" src/main/java/com/dju/demo/SaveController.java > src/main/java/com/dju/demo/SaveController.java.new
#mv src/main/java/com/dju/demo/SaveController.java src/main/java/com/dju/demo/SaveController.java.old
#mv src/main/java/com/dju/demo/SaveController.java.new src/main/java/com/dju/demo/SaveController.java
#
#if [ -d target ]; then
#  rm -r target
#fi
#mvn package
##/c/Program\ Files/JetBrains/IntelliJ\ IDEA\ 2021.3.1/plugins/maven/lib/maven3/bin/mvn package
#
#cd target
#cp demo-*.jar "demo-$INPUT_VERSION-SNAPSHOT.jar"
#
## TODO SSH key
#echo "Uploading API..."
#scp "demo-$INPUT_VERSION-SNAPSHOT.jar" "pi@$INPUT_SSHSERVER:$INPUT_APIPATH"

# export INPUT_VERSION="1.0.6"; export INPUT_SSHSERVER="192.168.0.17"; export INPUT_APIPATH="/home/pi/servers"; export INPUT_APPPATH="/var/www/splitman/html/"; export INPUT_EXT_ADDR=""; JAVA_HOME="/c/Program Files/Java/openjdk-12+32_windows-x64_bin"

# TODO SSH key
echo "Restarting API server..."
#ssh -oBatchMode=yes "pi@$INPUT_SSHSERVER" bash << EOF
#  ps axjf | grep "[d]emo"
#  netstat -lapute | grep :8888
#
#  # SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"; echo "SERVER_PID: $SERVER_PID"; if [ ! -z "$SERVER_PID" ]; then kill "$SERVER_PID"; fi
#  cd /home/pi/servers
#  ./stopServer.sh
#  java -jar "$(ls | grep "demo" | sort | tail -n 1)" --server.port=8888 &
#EOF
ssh -oBatchMode=yes "pi@$INPUT_SSHSERVER" bash << EOF
  cd /home/pi/servers
#  ./relaunchServer.sh &

  ./stopServer.sh
  java -jar "$(ls | grep "demo" | sort | tail -n 1)" --server.port=8888 &
EOF

