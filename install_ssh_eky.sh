#! /bin/bash

set -e

# add ssh key
if [ -z "$SSH_KEY" ] || [ ! -f "$SSH_KEY" ]; then
    echo "can't find downloaded SSH key"
    exit 1
fi
mkdir -p ~/.ssh
sudo cp "$SSH_KEY" ~/.ssh/id_rsa

sudo chown "$(whoami)" ~/.ssh/id_rsa
sudo chmod 600 ~/.ssh/id_rsa
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Can't find copied SSH key"
    exit 1
fi
ls -al ~/.ssh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
