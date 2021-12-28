#! /bin/bash

WAIT_FOR_SERVER=1

while [ $WAIT_FOR_SERVER == 1 ]
do
  DATA="$(curl "$1" 2> /dev/null)"
  if [ $? != 0 ]; then
    sleep 5
  else
    WAIT_FOR_SERVER=0
  fi
done
echo "Done"
