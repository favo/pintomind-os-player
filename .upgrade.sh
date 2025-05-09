#!/bin/bash

# fjerne de servicene som er enablet,
 ble-bridge.service, bluetooth-power.service, pintomind-player.service

# Stop script on any error
set -e  

echo "==> Removing old services..."

# Remove ble-bridge.service
sudo rm -f /etc/systemd/system/ble-bridge.service
sudo rm -f /etc/systemd/system/multi-user.target.wants/ble-bridge.service

# Remove bluetooth-power.service
sudo rm -f /etc/systemd/system/bluetooth-power.service
sudo rm -f /etc/systemd/system/multi-user.target.wants/bluetooth-power.service

# Remove pintomind-player.service
sudo rm -f /etc/systemd/user/pintomind-player.service
sudo rm -f /home/pi/.config/systemd/user/default.target.wants/pintomind-player.service
sudo rm -f /etc/xdg/systemd/user/pintomind-player.service

echo "==> Installing Pintomind Player..."

# Add Pintomind APT key and repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.pintomind.com/pubkey.asc | sudo gpg --dearmor -o /etc/apt/keyrings/pintomind.gpg

echo 'deb [arch=arm64 signed-by=/etc/apt/keyrings/pintomind.gpg] https://deb.pintomind.com stable main' | \
    sudo tee /etc/apt/sources.list.d/pintomind.list

# Update and install pintomind-player
sudo apt-get update
sudo apt-get full-upgrade -y
sudo apt-get install -y pintomind-player

echo "==> Setup complete. Rebooting..."
sudo reboot