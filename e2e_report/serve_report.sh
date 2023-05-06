#! /bin/bash

echo "Starting server, you can navigate to http://127.0.0.1:3001/index.html"
npx simple-server "$(dirname "$0")" 3001
