#!/bin/bash

set -e

function install_gradle() {
	# install gradle
	mkdir /opt/gradle
	curl https://downloads.gradle.org/distributions/gradle-7.6.1-bin.zip -O
	unzip -d /opt/gradle gradle-*-bin.zip
	ls /opt/gradle/gradle-*

	export PATH="$PATH:"/opt/gradle/gradle-*/bin

	gradle -v
}

function install_android_sdk() {
	# install android sdk
  #sudo apt install default-jdk
	sudo apt install android-sdk
  #sudo find / -name android

  ls -ald /usr/local/lib/android
  ls -ald /usr/local/lib/android/sdk/tools/android
  echo "$PATH"

  export ANDROID_HOME="/usr/local/lib/android/sdk"
  export PATH="$PATH:$ANDROID_HOME/tools/bin"
  export PATH=":$PATH:$ANDROID_HOME/cmdline-tools/bin"
  export PATH=":$PATH:$ANDROID_HOME/emulator"
  export PATH=":$PATH:$ANDROID_HOME/platform-tools"

	#android update sdk
	#android list target
	ls -al "$ANDROID_HOME"
	echo "1"
	ls -al "$ANDROID_HOME/cmdline-tools"
	echo "2"
	ls -al "$ANDROID_HOME/emulator"
	echo "3"
	ls -al "$ANDROID_HOME/platform-tools"

#	echo "11"
#	sudo find /usr/local/lib/android/sdk/ -name sdkmanager
#	echo "12"
#	/usr/local/lib/android/sdk/tools/bin/sdkmanager --list
#	#sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
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

	sdkmanager --list
	#sdkmanager --install "platform-tools" "build-tools;30.0.1" "emulator" "platforms:android-33"
}

install_gradle
install_android_sdk
# install_android_sdk1
