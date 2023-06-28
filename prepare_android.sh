#!/bin/bash

set -e

function install_gradle() {
	# install gradle
	mkdir /opt/gradle
	curl https://downloads.gradle.org/distributions/gradle-7.6.1-bin.zip -O
	unzip -d /opt/gradle gradle-*-bin.zip
	ls /opt/gradle/gradle-*

  local PATH_TO_ADD="$(ls -d /opt/gradle/gradle-*/bin | head -n 1)"
	export PATH="$PATH:$PATH_TO_ADD"
	echo "export PATH=\"\$PATH:$PATH_TO_ADD\"" >> ~/.bashrc
  echo "$PATH_TO_ADD" > "/path_add_2"

  echo "$PATH"
  echo "gradle 00"
  ls -al /opt/gradle/gradle-*/bin
  echo "gradle version:"
	gradle -v
}

function install_sdkmanager() {
  mkdir -p ~/android/sdk
  pushd ~/android/sdk

  # curl https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O
  LATEST="$(curl -s https://developer.android.com/studio | grep -Eo "commandlinetools-linux.+\.zip" | head -n 1)"
  curl "https://dl.google.com/android/repository/$LATEST" -O
  unzip *.zip
  pushd cmdline-tools
  mkdir ../tools

  mv ./* ../tools/
  mv ../tools ./

  popd
  popd
}

function setAndroidPath() {
    echo "finding android home"

    local ANDROID_HOME0="$(dirname "$(find / -name cmdline-tools | head -n 1)")"
    echo "ANDROID_HOME0: $ANDROID_HOME0"
    local ANDROID_SDK_ROOT="$ANDROID_HOME"

    echo "export ANDROID_HOME=\"$ANDROID_HOME0\"
export ANDROID_SDK_ROOT=\"\$ANDROID_SDK_ROOT\"
export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/cmdline-tools/tools/bin:\$ANDROID_HOME/platform-tools\"" >> ~/.bashrc

    export ANDROID_HOME="$ANDROID_HOME0"
    export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
    PATH_TO_ADD="$ANDROID_HOME/tools/bin:$ANDROID_HOME/cmdline-tools/tools/bin:$ANDROID_HOME/platform-tools"
    export PATH="$PATH:$PATH_TO_ADD"
    echo "$PATH_TO_ADD" > "/path_add_1"

    cat "$HOME/.bashrc"

    echo "PATH: $PATH"
    echo "ANDROID_HOME: $ANDROID_HOME"
}

function install_android_sdk() {
	# install android sdk

  #  if [ $(getent group sudo) ] && [ -n "$(which sudo)" ]; then
  #    #sudo apt install default-jdk
  #    sudo apt install android-sdk -y
  #    #sudo find / -name android
  #  else
  #    apt install android-sdk -y
  #  fi
  #
  #  if [ -z "$(find / -name sdkmanager)" ]; then
  #    install_sdkmanager
  #  fi
  install_sdkmanager

  setAndroidPath

  echo "list...."
  sdkmanager --list

  echo "install...."
#  sdkmanager --licenses
  yes | sdkmanager --install "platform-tools" "build-tools;33.0.2" "emulator" "platforms;android-33"
  echo "installed 1...."
}

install_gradle
if [ -z "$1" ]; then
  install_android_sdk
fi
