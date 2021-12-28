#! /bin/bash

set -e

WORKING_DIR="$(pwd)"

## SETUP API
# get api
curl -o SplitMan2-API.zip https://codeload.github.com/lezhumain/SplitMan2-API/zip/refs/heads/master
#curl -o SplitMan2.zip https://codeload.github.com/lezhumain/SplitMan2/zip/refs/heads/version_1
unzip SplitMan2-API.zip

echo "Build APP and run Angular server"
npm ci
#npm run build:prod
npx ng serve &

echo "Build API and run"
cd SplitMan2-API-*
#mvn clean validate compile compiler:testCompile test package -f pom.xml
mvn package -f pom.xml

cd target
TARGET_JAR="$(ls demo-*.*.*-SNAPSHOT.jar | head -n 1)"

java -jar "$TARGET_JAR" --server.port=8888 &

echo "Waiting for API server..."
"$WORKING_DIR"/waitForServer.sh 127.0.0.1:8888
echo "API server running."

echo "Waiting for Angular server..."
"$WORKING_DIR"/waitForServer.sh 127.0.0.1:4200
echo "Angular server running."

SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"
APP_PID="$(ps -fu $USER| grep "[n]g serve" | awk '{print $2}')"

cd "$WORKING_DIR"

npm run e2e
RES="$?"

echo "Stopping API server"
kill "$SERVER_PID"

echo "Stopping app"
kill "$APP_PID"

exit $RES
