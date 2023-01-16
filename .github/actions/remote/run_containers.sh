#! /bin/bash

if [ -z "$DEBIAN_USER" ] || [ -z "$DEBIAN_IP" ]; then
  echo "Need to export DEBIAN creds"
fi

scp .github/actions/waitForServer.sh "${DEBIAN_USER}@${DEBIAN_IP}:${DEBIAN_PATH}"

ssh -oBatchMode=yes "${DEBIAN_USER}@${DEBIAN_IP}:${DEBIAN_PATH}" bash << EOF
  cd "${DEBIAN_PATH}"
  chmod +x ./*.sh
  docker-compose up -d

  echo "Waiting for web server"
  bash .github/actions/waitForServer.sh "127.0.0.1:4200"

  echo "Setting up DB"
  cd ../SplitMan2-API
  mvn test -Dtest=MongoTests#mainSetup -f pom.xml
EOF
