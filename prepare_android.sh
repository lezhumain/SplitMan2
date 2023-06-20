#!/bin/bash

set -e

function install_gradle() {
  if [ -d "/opt/gradle" ]; then
    return
  fi

	# install gradle
	mkdir /opt/gradle
	curl https://downloads.gradle.org/distributions/gradle-7.6.1-bin.zip -O
	unzip -d /opt/gradle gradle-*-bin.zip
	ls /opt/gradle/gradle-*

	GRADL="$(ls -d /opt/gradle/gradle-*/bin | head -n 1)"
	ls -al "$GRADL"

	export PATH="$PATH:$GRADL"

	gradle -v
}

#function install_android_sdk() {
#	# install android sdk
#  #sudo apt install default-jdk
#	apt install -y android-sdk
#  #sudo find / -name android
#
##  set +e
##  echo "0"
##  whereis android
#  echo "01"
#  find /usr/lib/ -name sdk
#  echo "02"
#  find /usr/lib/ -name sdk | head -n 1
#  echo "03"
#  ANDROID="$(find /usr/lib/ -name android | head -n 1)"
#  echo "04"
##  set -e
#
##  ls -ald /usr/local/lib/android
##  ls -ald /usr/local/lib/android/sdk/tools/android
#  echo "$PATH"
#
##  export ANDROID_HOME="$ANDROID/sdk"
##  export PATH="$PATH:$ANDROID_HOME/tools/bin"
##  export PATH=":$PATH:$ANDROID_HOME/cmdline-tools/bin"
##  export PATH=":$PATH:$ANDROID_HOME/emulator"
##  export PATH=":$PATH:$ANDROID_HOME/platform-tools"
##
##  #android update sdk
##  #android list target
##  ls -al "$ANDROID_HOME"
##  echo "1"
##  ls -al "$ANDROID_HOME/cmdline-tools"
##  echo "2"
##  ls -al "$ANDROID_HOME/emulator"
##  echo "3"
##  ls -al "$ANDROID_HOME/platform-tools"
##
###	echo "11"
###	sudo find /usr/local/lib/android/sdk/ -name sdkmanager
###	echo "12"
##
##  echo "list...."
##  sdkmanager --list
##  #  echo "install...."
##  #  sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
##  #  echo "installed 1...."
#}

function install_android_sdk() {
  apt update
	# install android sdk
  #sudo apt install default-jdk
	apt install -y android-sdk
  #sudo find / -name android

#  ls -ald /usr/local/lib/android
#  ls -ald /usr/local/lib/android/sdk/tools/android
#  echo "$PATH"

  export ANDROID_HOME="$(dirname "$(find / -name platform-tools)")"
  export PATH="$PATH:$ANDROID_HOME/tools/bin"
  export PATH=":$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
  export PATH=":$PATH:$ANDROID_HOME/emulator"
  export PATH=":$PATH:$ANDROID_HOME/platform-tools"

#  #android update sdk
#  #android list target
##  ls -al "$ANDROID_HOME"
##  echo "1"
##  ls -al "$ANDROID_HOME/cmdline-tools"
##  echo "2"
##  ls -al "$ANDROID_HOME/emulator"
##  echo "3"
##  ls -al "$ANDROID_HOME/platform-tools"
#
##	echo "11"
##	sudo find /usr/local/lib/android/sdk/ -name sdkmanager
##	echo "12"
#
#  echo "list...."
#  sdkmanager --list
#  #  echo "install...."
#  #  sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
#  #  echo "installed 1...."
}

function install_cmdlinetools() {
  cd "$ANDROID_HOME"

	# install android sdk 1
#  mkdir -p ~/android/sdk
#  cd ~/android/sdk
  curl https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O
  unzip *.zip
  mkdir /tmp/latest
  mv cmdline-tools/* /tmp/latest
  mv /tmp/latest cmdline-tools/
#  cd cmdline-tools
#  mkdir ../tools

#  mv * ../tools
#  mv ../tools ./
#  export ANDROID_HOME="$HOME/android/sdk"
#  export PATH="$ANDROID_HOME/cmdline-tools/tools/bin/:$PATH"
#  export PATH="$ANDROID_HOME/emulator/:$PATH"
#  export PATH="$ANDROID_HOME/platform-tools/:$PATH"
#
#  echo "list...."
#  sdkmanager --list
#  #  echo "install...."
#  #  sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
#  #  echo "installed 1...."
}

function install_android_sdk1() {
	# install android sdk 1
  mkdir -p ~/android/sdk
  cd ~/android/sdk
  curl https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O
  sudo unzip *.zip
  cd cmdline-tools
  mkdir tools
  mv -i * tools
  export ANDROID_HOME="$HOME/android/sdk"
  export PATH="$ANDROID_HOME/cmdline-tools/tools/bin/:$PATH"
  export PATH="$ANDROID_HOME/emulator/:$PATH"
  export PATH="$ANDROID_HOME/platform-tools/:$PATH"

#  echo "list...."
#  sdkmanager --list
  #  echo "install...."
  #  sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
  #  echo "installed 1...."

  if [ -z "$(find / -name sdkmanager)" ]; then
    install_cmdlinetools
  fi

  sdkmanager --list
}

install_gradle

#install_android_sdk
#install_android_sdk1
