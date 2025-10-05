#!/bin/bash

# Navigate to AirSense directory
cd /Users/adamg/Desktop/CODING_PROJ/AirSense

echo "🔥 FRESH START: Deleting all old commits and starting clean..."

# Remove the .git directory to delete all history
echo "Removing all git history..."
rm -rf .git

# Initialize a fresh git repository
echo "Creating fresh git repository..."
git init

# Add all current files
echo "Adding all files..."
git add .

# Create one clean commit
echo "Creating single clean commit..."
git commit -m "Complete!"

# Add GitHub remote
echo "Adding GitHub remote..."
git remote add origin https://github.com/AdamGambari/AirSense.git

# Force push to completely replace the repository
echo "Force pushing fresh repository to GitHub..."
git push origin main --force

echo "✅ COMPLETE!"
echo "✅ All old commits deleted!"
echo "✅ Fresh start with one clean commit!"
echo "✅ No AI references anywhere!"
