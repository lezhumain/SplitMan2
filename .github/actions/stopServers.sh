#! /bin/bash


APP_PID="$(ps -fu $USER| grep "[n]g serve" | awk '{print $2}')"
SERVER_PID="$(ps -fu $USER| grep "[d]emo" | awk '{print $2}')"

if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping API server: $SERVER_PID"
    kill "$SERVER_PID"
fi

if [ ! -z "$APP_PID" ]; then
    echo "Stopping app: $APP_PID"
    kill "$APP_PID"
fi

echo "Done"
