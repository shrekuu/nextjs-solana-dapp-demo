#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

PORT="$DEPLOYMENT_PORT"

./stop.sh

sleep 0.5

PORT="$PORT" pnpm dev
