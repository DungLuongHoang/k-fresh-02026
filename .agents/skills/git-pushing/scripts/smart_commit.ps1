param(
    [string]$Message = "chore: update code"
)

$ErrorActionPreference = "Stop"

try {
    # Add all changes
    git add .

    # Commit with the provided message
    git commit -m $Message

    # Get current branch name
    $Branch = git rev-parse --abbrev-ref HEAD

    # Push to remote, setting upstream if needed
    git push -u origin $Branch

    Write-Host "✅ Successfully pushed to $Branch" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to push changes." -ForegroundColor Red
    exit 1
}
