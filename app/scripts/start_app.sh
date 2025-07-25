#!/bin/sh
#
# ABSTRACT: Script to start the app

cd /app

export HOST=0.0.0.0
export PORT=16007
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    yarn install
fi

echo "Iniciando aplicação na porta $PORT..."

# 1 Dev run
exec sh -c "yarn start"

# 2 Loop (alternativa para debug)
#exec sh -c "while true; do sleep 1; done"
