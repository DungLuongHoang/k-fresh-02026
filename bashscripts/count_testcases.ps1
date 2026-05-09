# PowerShell Script to Generate Test Case Report for Windows

Write-Host "Generating count test case report" -ForegroundColor Cyan
Write-Host ""

# Get the first day of the current month and today's date
$START_DATE = (Get-Date -Day 1).ToString("yyyy-MM-dd")  # First day of this month
$END_DATE = (Get-Date).ToString("yyyy-MM-dd")  # Today's date

Write-Host "Fetching logs from $START_DATE to $END_DATE..."

# Initialize totals
$total_new_tests = 0
$total_modified_tests = 0
$total_files = 0  

# Get unique authors in the last 30 days
$authors = git log --since="$START_DATE" --until="$END_DATE" --format="%an" | Sort-Object -Unique

# Start Markdown table
Write-Host "### Test Cases (New vs Modified) and New Test Files Added by QA (This Month)"
Write-Host ""
Write-Host "| Author          | New Test Cases | Modified Test Cases | New Test Files |"
Write-Host "|-----------------|----------------|----------------------|---------------|"

foreach ($author in $authors) {
    $new_test_count = 0
    $modified_test_count = 0
    $file_count = 0

    # ✅ Get newly added and renamed test files
    $new_files = git log --since="$START_DATE" --until="$END_DATE" --author="$author" --diff-filter=A --name-status | ForEach-Object {
        $line = $_ -split "\s+"
        if ($line[0] -eq "A") { $line[1] }
        elseif ($line[0] -match "^R[0-9]*") { $line[2] }
    } | Sort-Object -Unique | Where-Object { $_ -match "^tests/.*\.spec\.ts$" }

    if ($new_files) {
        $file_count = ($new_files | Measure-Object).Count
        foreach ($file in $new_files) {
            if (Test-Path $file) {
                $test_count = (Select-String -Path $file -Pattern "test\(" -AllMatches).Matches.Count
                $new_test_count += $test_count
            }
        }
    }

    # ✅ Count `test(` occurrences in modified lines only, including renamed files
    $modified_test_count = (git log --since="$START_DATE" --until="$END_DATE" --author="$author" -p -- "tests/*.spec.ts" | Select-String -Pattern "^\+.*test\(" -AllMatches).Matches.Count

    # Ensure values are numeric
    $new_test_count = [int]$new_test_count
    $modified_test_count = [int]$modified_test_count
    $file_count = [int]$file_count

    # ✅ Only print authors with non-zero values
    if ($new_test_count -ne 0 -or $modified_test_count -ne 0 -or $file_count -ne 0) {
        Write-Host ("| {0,-15} | {1,-14} | {2,-20} | {3,-13} |" -f $author, $new_test_count, $modified_test_count, $file_count)
        
        # Update totals
        $total_new_tests += $new_test_count
        $total_modified_tests += $modified_test_count
        $total_files += $file_count
    }
}

# Print totals in Markdown format
Write-Host ""
Write-Host "Total New Tests:      $total_new_tests"
Write-Host "Total Modified Tests: $total_modified_tests"
Write-Host "Total Files:          $total_files"
Write-Host ""
Write-Host "**Done!**" -ForegroundColor Green