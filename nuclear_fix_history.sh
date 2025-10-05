#!/bin/bash

# Navigate to AirSense directory
cd /Users/adamg/Desktop/CODING_PROJ/AirSense

echo "🚨 NUCLEAR OPTION: Rewriting entire git history to remove AI references..."

# Interactive rebase to edit all commits
echo "Starting interactive rebase to edit commit messages..."
git rebase -i HEAD~5

echo ""
echo "In the editor that opens:"
echo "1. Change 'pick' to 'reword' for any commits mentioning AI"
echo "2. Save and close the editor"
echo "3. For each commit that opens, replace the message with something professional"
echo ""
echo "Professional alternatives:"
echo "- 'Refactor codebase and improve structure'"
echo "- 'Enhance error handling and logging'"
echo "- 'Update project configuration'"
echo "- 'Optimize for production deployment'"
echo ""
echo "After editing all commits, force push with: git push origin main --force"
echo ""
echo "⚠️  This will rewrite your entire git history!"
