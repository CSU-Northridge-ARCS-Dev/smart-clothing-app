#!/usr/bin/env bash

set -eox pipefail

if [[ "$EAS_BUILD_PLATFORM" == "android" && "$EAS_BUILD_PROFILE" == "test" ]]; then
  sudo apt-get --quiet update --yes

  # Install emulator & dependencies
  sudo apt-get --quiet install --yes libc6 libdbus-1-3 libfontconfig1 libgcc1 libpulse0 libtinfo5 libx11-6 libxcb1 libxdamage1 libnss3 libxcomposite1 libxcursor1 libxi6 libxext6 libxfixes3 zlib1g libgl1 pulseaudio socat

  # Install system image for emulator
  sdkmanager --install "system-images;android-31;google_apis;x86_64"
  avdmanager --verbose create avd --force --name "Pixel_4_API_30" --device "Pixel_4_API_30" --package "system-images;android-31;google_apis;x86_64"
fi