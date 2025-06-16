#!/bin/bash

echo "Starting development server with monitoring..."

# Kill any existing processes on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Killing existing process on port 3000..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null
    sleep 1
fi

# Function to keep server running
run_server() {
    while true; do
        echo "[$(date)] Starting Next.js dev server..."
        npm run dev
        EXIT_CODE=$?
        echo "[$(date)] Server exited with code $EXIT_CODE"
        
        if [ $EXIT_CODE -eq 130 ] || [ $EXIT_CODE -eq 2 ]; then
            echo "Server stopped by user (Ctrl+C)"
            break
        fi
        
        echo "Restarting in 2 seconds..."
        sleep 2
    done
}

# Run the server
run_server