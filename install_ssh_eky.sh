#! /bin/bash

set -e

#TARGET_KEY="~/.ssh/id_devops"
TARGET_KEY="~/.ssh/id_rsa"

# add ssh key
if [ -z "$SSH_KEY" ] || [ ! -f "$SSH_KEY" ]; then
    echo "can't find downloaded SSH key"
    exit 1
fi
mkdir -p ~/.ssh
sudo cp "$SSH_KEY" "$TARGET_KEY"

sudo chown "$(whoami)" "$TARGET_KEY"
sudo chmod 600 "$TARGET_KEY"
if [ ! -f "$TARGET_KEY" ]; then
    echo "Can't find copied SSH key"
    exit 1
fi
ls -al ~/.ssh
eval "$(ssh-agent -s)"
ssh-add "$TARGET_KEY"
