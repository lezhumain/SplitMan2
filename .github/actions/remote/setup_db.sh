#! /bin/bash

if [ -z "$DEBIAN_PATH" ]; then
  echo "Need to export DEBIAN path"
fi

ssh -oBatchMode=yes "ovhVM_rel" bash << EOF
  cd "${DEBIAN_PATH}/../SplitMan2-API"
  mvn test -Dtest=MongoTests#mainSetup -f pom.xml
EOF
