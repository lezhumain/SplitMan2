#! /bin/bash

set -e

mkdir -p "$HOME/.ssh"
mkdir -p "/root/.ssh"

ssh-keyscan -t rsa github.com >> "/etc/ssh/known_hosts"

cp /etc/ssh/known_hosts /root/.ssh/known_hosts
cp /etc/ssh/known_hosts $HOME/.ssh/known_hosts

eval `ssh-agent -s`
ssh-add - <<< "$INPUT_SSHKEY"

sed "s/0.0.0/$INPUT_VERSION/" package.json > package.json.new
mv package.json package.json.old
mv package.json.new package.json

npm run build:safe:prod
scp -r dist/SplitMan21/* "releaser@$INPUT_SSHSERVER:$INPUT_APPPATH"

git clone git@github.com:lezhumain/SplitMan2-API.git
cd SplitMan2-API
mvn package
cd target
cp demo-*.jar "demo-$INPUT_VERSION-SNAPSHOT.jar"
scp "demo-$INPUT_VERSION-SNAPSHOT.jar" "releaser@$INPUT_SSHSERVER:$INPUT_APIPATH"
