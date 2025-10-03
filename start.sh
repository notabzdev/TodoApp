#!/bin/bash
set -e

echo "🚀 Starting Railway app..."

cd Backend

# install dependencies
npm install

# run server (change server.js if your entry file is app.js or index.js)
node server.js
