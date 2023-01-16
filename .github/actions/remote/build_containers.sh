#! /bin/bash

if [ -z "$DEBIAN_USER" ] || [ -z "$DEBIAN_IP" ]; then
  echo "Need to export DEBIAN creds"
fi

# copy run script
scp .github/actions/run_docker_e2e.sh "${DEBIAN_USER}@${DEBIAN_IP}:${DEBIAN_PATH}"
scp docker-compose.yml "${DEBIAN_USER}@${DEBIAN_IP}:${DEBIAN_PATH}/"

ssh -oBatchMode=yes "${DEBIAN_USER}@${DEBIAN_IP}:${DEBIAN_PATH}" bash << EOF
  cd "${DEBIAN_PATH}"
  chmod +x ./*.sh
  ./run_docker_e2e.sh "" "https"
EOF
