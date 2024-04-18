#! /bin/bash

set -e

#TARGET_KEY="~/.ssh/id_devops"
TARGET_KEY_FOLDER="~/.ssh"
TARGET_KEY="$TARGET_KEY_FOLDER/id_rsa"

mkdir -p "$TARGET_KEY_FOLDER"

# add ssh key
if [ -z "$SSH_KEY" ] || [ ! -f "$SSH_KEY" ]; then
    # echo "can't find downloaded SSH key"
    # exit 1
    SSH_KEY="./id_rsa"
fi
mkdir -p ~/.ssh

cp "$SSH_KEY" "$TARGET_KEY"
chown "$(whoami)" "$TARGET_KEY"
chmod 600 "$TARGET_KEY"

if [ ! -f "$TARGET_KEY" ]; then
    echo "Can't find copied SSH key"
    exit 1
fi

ls -al ~/.ssh
eval "$(ssh-agent -s)"
ssh-add "$TARGET_KEY"
