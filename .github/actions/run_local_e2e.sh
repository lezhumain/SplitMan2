#! /bin/bash

## SETUP API
# get api
curl -o SplitMan2-API.zip https://codeload.github.com/lezhumain/SplitMan2-API/zip/refs/heads/master
#curl -o SplitMan2.zip https://codeload.github.com/lezhumain/SplitMan2/zip/refs/heads/version_1
unzip SplitMan2-API.zip

cd SplitMan2-API-*
mvn clean validate compile compiler:testCompile test package -f pom.xml


TARGET_JAR="$(ls demo-*.*.*-SNAPSHOT.jar | head -n 1)"

cd target

#ls
#cp "$TARGET_JAR" ../

/usr/lib/jvm/default-java/bin/java  -jar "$TARGET_JAR" --server.port=8888 &

sleep 20

SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"


## SETUP app
npm ci
npm run build:prod
ng serve &
APP_PID="$(ps -fu $USER| grep "[n]g serve" | awk '{print $2}')"

sleep 20

#npm run e2e
#RES="$?"

echo "Stopping API server"
kill "$SERVER_PID"

echo "Stopping app"
kill "$APP_PID"

#exit $RES
