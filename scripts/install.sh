#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"

echo "Installerer verktøy på i /usr/local/bin - vil trenge sudo"
sudo ln -sf "$SCRIPT_DIR/ssh" /usr/local/bin/p2m-ssh
sudo ln -sf "$SCRIPT_DIR/scp" /usr/local/bin/p2m-scp
sudo ln -sf "$SCRIPT_DIR/log" /usr/local/bin/p2m-log
sudo ln -sf "$SCRIPT_DIR/scan_for_pi" /usr/local/bin/p2m-scan

echo "Satt opp følgende verktøy"
echo "p2m-ssh - logg inn på raspberry pi med ssh"
echo "p2m-scp - kopier filer til raspberry pi"
echo "p2m-log - se logg filer på raspberry pi"
echo "p2m-scan - Let etter raspberry pi som det bruker lokale nettverket"