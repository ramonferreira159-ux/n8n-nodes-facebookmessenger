#!/bin/bash

# Release script for n8n-nodes-facebookmessenger
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Get the version bump type (default to patch)
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Invalid version type. Use 'patch', 'minor', or 'major'."
    exit 1
fi

echo "🚀 Starting release process..."

# Make sure we're on the latest master
echo "📥 Pulling latest changes..."
git checkout master
git pull origin master

# Run tests and build
echo "🧪 Running tests and build..."
npm ci
npm run build
npm run lint

# Bump version
echo "📈 Bumping $VERSION_TYPE version..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo "New version: $NEW_VERSION"

# Update package-lock.json
npm install --package-lock-only

# Commit version bump
echo "💾 Committing version bump..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
echo "🏷️  Creating and pushing tag..."
git tag $NEW_VERSION
git push origin master
git push origin $NEW_VERSION

echo "✅ Release $NEW_VERSION initiated!"
echo "🔗 Check the GitHub Actions workflow at: https://github.com/ItsMeStevieG/n8n-nodes-facebookmessenger/actions"
echo "📦 The package will be automatically published to npm when the workflow completes."
