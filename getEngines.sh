#! /bin/bash

echo "Engine clauses:"
echo "node:"
jq -r '.packages | to_entries[].value.engines.node' package-lock.json | sort | uniq

echo "npm:"
jq -r '.packages | to_entries[].value.engines.npm' package-lock.json | sort | uniq

#LINES="$(jq -r '.devDependencies | keys[]' package.json)"
#IFS=$'\n'
#for LINE in $LINES
#do
#  echo "--$LINE"
#done
