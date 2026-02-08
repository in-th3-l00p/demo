#!/bin/sh
set -e

# Generate secrets if not provided
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET=$(head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n')
  echo "[entrypoint] Generated random JWT_SECRET"
fi

if [ -z "$SERVER_MASTER_KEY" ]; then
  export SERVER_MASTER_KEY=$(head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n')
  echo "[entrypoint] Generated random SERVER_MASTER_KEY"
fi

exec node serve.mjs
