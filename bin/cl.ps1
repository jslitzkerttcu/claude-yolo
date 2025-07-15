# Claude YOLO/SAFE Mode Wrapper Script
# Usage: cl.ps1 /YON | /YOFF | /STATUS | /HELP | [claude commands]

param(
    [Parameter(Position=0)]
    [string]$Command,
    [Parameter(Position=1)]
    [string]$Argument
)

# Colors for output
$RED = "`e[31m"
$YELLOW = "`e[33m"
$CYAN = "`e[36m"
$GREEN = "`e[32m"
$RESET = "`e[0m"

function Write-Colored($Text, $Color) {
    Write-Host "$Color$Text$RESET"
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Colored "Error: Node.js is not installed. Please install Node.js first." $RED
    exit 1
}

# Check if the main script exists
$scriptPath = Join-Path $PSScriptRoot "claude-yolo.js"
if (-not (Test-Path $scriptPath)) {
    Write-Colored "Error: Main script not found. Please reinstall the package." $RED
    exit 1
}

# Run the main script with arguments
& node $scriptPath $Command $Argument
