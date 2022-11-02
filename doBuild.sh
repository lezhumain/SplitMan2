#! /bin/bash

function sedi()
{
  if [ -z "$(uname -a | grep -i darwin)" ]; then
    #linux
    sed -i.bak "$1" "$2" "$3"
    #sed -i.bak "s|PROD_IP|$1|g" src/environments/environment.prod.ts
  else
    # macos
    sed -i ".bak" "$1" "$2" "$3"
  fi
}

# change IP
#sed -i.bak -e "s|PROD_IP|$1|g" src/environments/environment.prod.ts
#sedi -e "s|PROD_IP|$1|g" src/environments/environment.prod.ts
#sedi -e "s|/api|$2|g" src/environments/environment.prod.ts

docker build --build-arg IP="$1" --build-arg API="$2" -t splitman2 .
