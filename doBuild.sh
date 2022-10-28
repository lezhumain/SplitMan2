#! /bin/bash

function sedi()
{
  if [ -z "$(uname -a | grep -i darwin)" ]; then
    #linux
    sed -i .bak $1 $2 $3
  else
    # macos
    sed -i".bak" $1 $2 $3
  fi
}

# change IP
#sed -i .bak "s|PROD_IP|$1|g" src/environments/environment.prod.ts
sedi "s|PROD_IP|$1|g" src/environments/environment.prod.ts

docker build -t splitman2 .
