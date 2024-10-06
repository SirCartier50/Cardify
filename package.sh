#!/bin/bash

declare -r app_name="aiflash"
declare -r version="1.0"

set -e

export NODE_ENV=production
npm run build

zip -r app.zip .next app public utils *.json *.js .env.local *.ts