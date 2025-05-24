# Release script for n8n-nodes-facebookmessenger
# Usage: .\scripts\release.ps1 [patch|minor|major]

param(
    [Parameter(Position=0)]
    [ValidateSet("patch", "minor", "major")]
    [string]$VersionType = "patch"
)

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Error: package.json not found. Please run this script from the project root."
    exit 1
}

# Check if git working directory is clean
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Error "Error: Working directory is not clean. Please commit or stash your changes."
    exit 1
}

Write-Host "🚀 Starting release process..." -ForegroundColor Green

# Make sure we're on the latest master
Write-Host "📥 Pulling latest changes..." -ForegroundColor Yellow
git checkout master
git pull origin master

# Run tests and build
Write-Host "🧪 Running tests and build..." -ForegroundColor Yellow
npm ci
npm run build
npm run lint

# Bump version
Write-Host "📈 Bumping $VersionType version..." -ForegroundColor Yellow
$newVersion = npm version $VersionType --no-git-tag-version
Write-Host "New version: $newVersion" -ForegroundColor Green

# Update package-lock.json
npm install --package-lock-only

# Commit version bump
Write-Host "💾 Committing version bump..." -ForegroundColor Yellow
git add package.json package-lock.json
git commit -m "chore: bump version to $newVersion"

# Create and push tag
Write-Host "🏷️  Creating and pushing tag..." -ForegroundColor Yellow
git tag $newVersion
git push origin master
git push origin $newVersion

Write-Host "✅ Release $newVersion initiated!" -ForegroundColor Green
Write-Host "🔗 Check the GitHub Actions workflow at: https://github.com/ItsMeStevieG/n8n-nodes-facebookmessenger/actions" -ForegroundColor Cyan
Write-Host "📦 The package will be automatically published to npm when the workflow completes." -ForegroundColor Cyan
