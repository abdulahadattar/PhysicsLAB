#!/bin/bash
# Enhanced debugging script: runs a command, logs all output to debug-log.txt with timestamps

LOGFILE="debug-log.txt"
CMD="$@"

{
  echo -e "\n[DEBUG RUN $(date -Iseconds)] Command: $CMD\n"
  eval "$CMD" 2>&1
  echo -e "\n[END DEBUG RUN $(date -Iseconds)]\n"
} | tee -a "$LOGFILE"