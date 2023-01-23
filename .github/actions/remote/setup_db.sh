#! /bin/bash

if [ -z "$DEBIAN_PATH" ] || [ -z "$DEBIAN_IP" ]; then
  echo "Need to export DEBIAN path"
fi

COUNT="$(curl -s --insecure "https://79.137.33.77:8081/api/itemCount")"
if [ "$COUNT" == "0" ]; then
  ssh -oBatchMode=yes "ovhVM_rel" bash << EOF
  cd "${DEBIAN_PATH}/../SplitMan2-API"
  sed -i.bak 's|mongodb|"$DEBIAN_IP"|g' src/main/java/com/dju/demo/HostIP.java
  mvn test -Dtest=MongoTests#mainSetup -f pom.xml
EOF
else
  echo "Items already present"
fi
