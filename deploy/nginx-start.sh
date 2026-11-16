#!/bin/sh
set -eu
: "${NA_BACKEND_HOST:=new-arrivals-back-1}"
# Docker hostname is the only allowed variable in our nginx template.
case "$NA_BACKEND_HOST" in
  ''|*[!a-zA-Z0-9_.-]*) echo 'NA_BACKEND_HOST invalide' >&2; exit 1 ;;
esac
# All generated configuration, PID and request buffers live in /tmp. This
# supports the nginx user and ValaDeploy's read-only static frontend profile.
runtime_dir=$(mktemp -d /tmp/new-arrivals-nginx.XXXXXX)
sed "s/__NA_BACKEND_HOST__/${NA_BACKEND_HOST}/g" \
  /etc/new-arrivals/nginx.conf.template > "$runtime_dir/server.conf"
cat > "$runtime_dir/nginx.conf" <<EOF
worker_processes auto;
pid $runtime_dir/nginx.pid;
error_log /dev/stderr warn;
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /dev/stdout;
  sendfile on;
  keepalive_timeout 65;
  client_body_temp_path $runtime_dir/client;
  proxy_temp_path $runtime_dir/proxy;
  fastcgi_temp_path $runtime_dir/fastcgi;
  uwsgi_temp_path $runtime_dir/uwsgi;
  scgi_temp_path $runtime_dir/scgi;
  include $runtime_dir/server.conf;
}
EOF
exec nginx -c "$runtime_dir/nginx.conf" -g 'daemon off;'
