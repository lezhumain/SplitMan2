#! /bin/bash

if [ -z "$DEBIAN_PATH" ]; then
  echo "Need to export DEBIAN path"
fi

scp .github/actions/waitForServer.sh "ovhVM_rel:${DEBIAN_PATH}"

ssh -oBatchMode=yes "ovhVM_rel" bash << EOF
  cd "${DEBIAN_PATH}"
  chmod +x ./*.sh
  docker-compose up -d

  echo "Waiting for web server"
  bash waitForServer.sh "127.0.0.1:8080"
  bash waitForServer.sh "127.0.0.1:4200"

  sleep 60
  docker ps
EOF
