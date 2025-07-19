#!/bin/sh
set -e

# Start Xvfb
Xvfb :99 -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} -ac +extension RANDR > /dev/null 2>&1 &

# Start the application
exec "$@"
