#! /bin/bash

# change IP
sed -i .bak "s|PROD_IP|$1|g" src/environments/environment.prod.ts

docker build -t splitman2 .
