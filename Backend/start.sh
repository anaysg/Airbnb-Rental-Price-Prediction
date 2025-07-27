#!/bin/bash

# Start script for the Airbnb Price Prediction API

echo "Starting Airbnb Price Prediction API..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip3 install -r requirements.txt

# Start the API server
echo "Starting FastAPI server on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
