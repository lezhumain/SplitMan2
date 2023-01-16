#! /bin/bash

set -e

if [ -z "$DEBIAN_PATH" ]; then
  echo "Need to export DEBIAN path"
fi

#ssh -oBatchMode=yes "${DEBIAN_USER}@${DEBIAN_IP}" bash << EOF
ssh -oBatchMode=yes ovhVM_rel bash << EOF
  ls -al
  cd "${DEBIAN_PATH}"
  ls -al
  chmod +x ./*.sh
  cd ../SplitMan2
  zip -r "../SplitMan2_$(date +%s).zip"
  cd ../SplitMan2-API
  zip -r "../SplitMan2-API_$(date +%s).zip"
  cd ../SplitMan2-nginx
  zip -r "../SplitMan2-nginx_$(date +%s).zip"
  cd ../SplitMan2-run
  zip -r "../SplitMan2-run_$(date +%s).zip"
  cd "${DEBIAN_PATH}"
EOF
