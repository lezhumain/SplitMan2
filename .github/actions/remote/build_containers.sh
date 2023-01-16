#! /bin/bash

#if [ -z "$DEBIAN_USER" ] || [ -z "$DEBIAN_IP" ]; then
#  echo "Need to export DEBIAN creds"
#fi
if [ -z "$DEBIAN_PATH" ]; then
  echo "Need to export DEBIAN path"
fi

# copy run script
scp .github/actions/run_docker_e2e.sh "ovhVM_rel:${DEBIAN_PATH}"
scp docker-compose.yml "ovhVM_rel:${DEBIAN_PATH}/"

ssh -oBatchMode=yes "ovhVM_rel" bash << EOF
  cd "${DEBIAN_PATH}"
  chmod +x ./*.sh
  ./run_docker_e2e.sh "" "https"
EOF
