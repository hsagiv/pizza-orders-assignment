#!/bin/bash
# Test script for Docker build issues
# This script tests if all Docker builds work correctly

echo "🧪 Testing Docker builds..."

# Test backend build
echo "📦 Testing backend build..."
cd server
if docker build -t pizza-backend-test . > /dev/null 2>&1; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# Test frontend build
echo "📦 Testing frontend build..."
cd client
if docker build -t pizza-frontend-test . > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Test Docker Compose
echo "🐳 Testing Docker Compose..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose configuration valid"
else
    echo "❌ Docker Compose configuration invalid"
    exit 1
fi

echo "🎉 All Docker builds successful!"
