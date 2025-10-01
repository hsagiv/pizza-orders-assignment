#!/bin/sh
# Docker health check script for backend service

# Check if the application is responding
curl -f http://localhost:3001/health > /dev/null 2>&1

# Exit with the curl command's exit code
exit $?
