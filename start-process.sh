#!/bin/bash
echo "Kicking off process to watch pct calendar disconnected from tty"

# run with nohup and background so task keeps running when process that created this stops
nohup node watch.js > stdout.log 2> error.log &