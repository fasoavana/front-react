#!/bin/sh
set -eu
: "${NA_BACKEND_HOST:=new-arrivals-back-1}"
# Docker hostname is the only allowed variable in our nginx template.
case "$NA_BACKEND_HOST" in
  ''|*[!a-zA-Z0-9_.-]*) echo 'NA_BACKEND_HOST invalide' >&2; exit 1 ;;
esac
sed "s/__NA_BACKEND_HOST__/${NA_BACKEND_HOST}/g" \
  /etc/new-arrivals/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
