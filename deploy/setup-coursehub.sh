#!/bin/bash
# One-script server setup for Student Course Hub on the shared Oracle Cloud VM.
# Usage: sudo bash setup-coursehub.sh <domain>
# Idempotent. Coexists with the drivepro unit; touches nothing of DrivePro's.
# NOTE: DrivePro's setup-oci.sh REGENERATES /etc/caddy/Caddyfile wholesale.
# If it is ever re-run, re-run this script afterwards to restore the vhost.
set -euo pipefail

DOMAIN="${1:?usage: setup-coursehub.sh <domain>}"
REPO_URL="https://github.com/igor-vuta/student-course-hub.git"

# 1. deno (single static binary)
if [ ! -x /usr/local/bin/deno ]; then
  curl -fsSL https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip -o /tmp/deno.zip
  apt-get install -y unzip >/dev/null 2>&1 || true
  unzip -o /tmp/deno.zip -d /usr/local/bin >/dev/null && chmod +x /usr/local/bin/deno && rm /tmp/deno.zip
fi
/usr/local/bin/deno --version | head -1

# 2. system user + dirs
id coursehub >/dev/null 2>&1 || useradd --system --home /opt/coursehub --shell /usr/sbin/nologin coursehub
mkdir -p /opt/coursehub/data
if [ -d /opt/coursehub/repo/.git ]; then
  sudo -u coursehub git -C /opt/coursehub/repo pull --ff-only
else
  git clone "$REPO_URL" /opt/coursehub/repo
  chown -R coursehub:coursehub /opt/coursehub
fi
chown -R coursehub:coursehub /opt/coursehub

# 3. warm the deno module cache as the service user (service has no network surprises at boot)
cd /opt/coursehub/repo && sudo -u coursehub env DENO_DIR=/opt/coursehub/data/.deno_cache /usr/local/bin/deno cache src/main.ts || true

# 4. systemd units
cp /opt/coursehub/repo/deploy/coursehub.service /etc/systemd/system/
cp /opt/coursehub/repo/deploy/coursehub-reset.service /etc/systemd/system/
cp /opt/coursehub/repo/deploy/coursehub-reset.timer /etc/systemd/system/
# service user needs its module cache
sed -i 's|^ExecStart=|Environment=DENO_DIR=/opt/coursehub/data/.deno_cache\nExecStart=|' /etc/systemd/system/coursehub.service 2>/dev/null || true
systemctl daemon-reload
systemctl enable --now coursehub
systemctl enable --now coursehub-reset.timer

# 5. Caddy vhost (append-once, marker-guarded)
if ! grep -q "coursehub-vhost" /etc/caddy/Caddyfile; then
  cat >> /etc/caddy/Caddyfile <<EOF

# coursehub-vhost
$DOMAIN {
	encode zstd gzip
	reverse_proxy 127.0.0.1:4100
}
EOF
  systemctl reload caddy
fi

sleep 3
curl -sf "http://127.0.0.1:4100/login" >/dev/null && echo "OK: app answering on 4100" || { echo "FAIL: app not answering"; journalctl -u coursehub -n 20 --no-pager; exit 1; }
echo "Done. Site: https://$DOMAIN"
