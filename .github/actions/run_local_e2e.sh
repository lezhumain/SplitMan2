#! /bin/bash

set -e

WORKING_DIR="$(pwd)"

## SETUP API
# get api
curl -o SplitMan2-API.zip https://codeload.github.com/lezhumain/SplitMan2-API/zip/refs/heads/master
#curl -o SplitMan2.zip https://codeload.github.com/lezhumain/SplitMan2/zip/refs/heads/version_1
unzip SplitMan2-API.zip

cd SplitMan2-API-*
#mvn clean validate compile compiler:testCompile test package -f pom.xml
mvn package -f pom.xml

cd target

TARGET_JAR="$(ls demo-*.*.*-SNAPSHOT.jar | head -n 1)"

#ls
#cp "$TARGET_JAR" ../

java  -jar "$TARGET_JAR" --server.port=8888 &

"$WORKING_DIR"/waitForServer.sh 127.0.0.1:8888

SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"


## SETUP app
cd "$WORKING_DIR"
npm ci
#npm run build:prod
npx ng serve &

echo "waitForServer.sh..."
"$WORKING_DIR"/waitForServer.sh 127.0.0.1:4200
echo "ok"

APP_PID="$(ps -fu $USER| grep "[n]g serve" | awk '{print $2}')"


npm run e2e
RES="$?"

echo "Stopping API server"
kill "$SERVER_PID"

echo "Stopping app"
kill "$APP_PID"

exit $RES
