#!/bin/bash

# Kill any process using port 3000
echo "Checking for processes on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Found process on port 3000, killing it..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t)
    sleep 1
fi

# Start the dev server
echo "Starting Next.js development server on port 3000..."
npm run dev