#! /bin/bash

"/c/Program Files (x86)/Android/android-sdk/platform-tools"/adb.exe -s emulator-5556 logcat -v threadtime emulator-5554 -v color

#"/c/Program Files (x86)/Android/android-sdk/platform-tools"/adb.exe -s <simID> install apks/splitman2.apk
