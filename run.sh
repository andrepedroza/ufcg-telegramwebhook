#!/bin/bash

if [ -e /run/secrets/token ]; then
    token=$(< /run/secrets/token)
    export TOKEN=$token
fi

node /app/index.js
