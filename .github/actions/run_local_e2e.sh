#! /bin/bash

set -e

WORKING_DIR="$(pwd)"
API_PORT=8888

## SETUP API
# get api
echo "Downloading API code"
curl -o SplitMan2-API.zip https://codeload.github.com/lezhumain/SplitMan2-API/zip/refs/heads/master
#curl -o SplitMan2.zip https://codeload.github.com/lezhumain/SplitMan2/zip/refs/heads/version_1
unzip SplitMan2-API.zip > /dev/null

echo "Build APP"
npm ci
npm run cp-libs

echo "Changing API port to $API_PORT"
sed "s/:8080/:$API_PORT/g" src/environments/environment.ts > src/environments/environment.test.ts
mv src/environments/environment.ts src/environments/environment.dev.ts
cp src/environments/environment.test.ts src/environments/environment.ts

echo "Run APP server"
npx ng serve &

cd SplitMan2-API-*
echo "Build API"
mvn package -f pom.xml > /dev/null

cd target
TARGET_JAR="$(ls demo-*.*.*-SNAPSHOT.jar | head -n 1)"

echo "Run API server"
java -jar "$TARGET_JAR" --server.port="$API_PORT" &

echo "Waiting for API server..."
"$WORKING_DIR"/.github/actions/waitForServer.sh "127.0.0.1:$API_PORT"
echo "API server running."

echo "Waiting for Angular server..."
"$WORKING_DIR"/.github/actions/waitForServer.sh 127.0.0.1:4200
echo "Angular server running."

#SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"
#APP_PID="$(ps -fu $USER| grep "[n]g serve" | awk '{print $2}')"

cd "$WORKING_DIR"

echo "Running E2E tests"
npm run e2e
RES="$?"
echo "E2E tests results: $RES"

#echo "Stopping API server"
#kill "$SERVER_PID"

#echo "Stopping app"
#kill "$APP_PID"

if [ $RES != 0 ]; then
  RES=1
fi

exit $RES
