#!/bin/bash
# Bash port of count_testcases.ps1 — keep behavior aligned with the PowerShell version.

echo "Generating count test case report"
echo ""

# Date range: 1st of the current month → today (matches the .ps1)
START_DATE=$(date +%Y-%m-01)        # First day of this month
END_DATE=$(date +%Y-%m-%d)          # Today's date

echo "Fetching logs from $START_DATE to $END_DATE..."

# Initialize totals
total_new_tests=0
total_modified_tests=0
total_files=0

# Get unique authors in the date range
authors=()
while IFS= read -r author; do
    [ -n "$author" ] && authors+=("$author")
done < <(git log --since="$START_DATE" --until="$END_DATE" --format="%an" | sort | uniq)

# Start Markdown table
# Column widths chosen so the longest realistic author name still fits and
# numbers stay right-aligned for readability.
#   - Author:               22 chars  (fits "Mai Thi Thanh Loan" + headroom)
#   - New Test Cases:       14 chars
#   - Modified Test Cases:  19 chars  (= length of header)
#   - New Test Files:       14 chars
ROW_FMT="| %-22s | %14s | %19s | %14s |\n"
# Separator width per column = printf field width + 2 (for the surrounding spaces).
# Trailing colon = right-aligned numbers in any markdown viewer.
SEP="|------------------------|---------------:|--------------------:|---------------:|"

echo "### Test Cases (New vs Modified) and New Test Files Added by QA (This Month)"
echo ""
# shellcheck disable=SC2059
printf "$ROW_FMT" "Author" "New Test Cases" "Modified Test Cases" "New Test Files"
echo "$SEP"

for author in "${authors[@]}"; do
    new_test_count=0
    modified_test_count=0
    file_count=0

    # Get newly added and renamed test files (renames count as their new path)
    new_files=$(git log --since="$START_DATE" --until="$END_DATE" --author="$author" --diff-filter=AR --name-status | awk '
        $1 == "A" && $2 ~ /^tests\/.*\.spec\.ts$/ {
            added[$2] = 1
        }
        $1 ~ /^R[0-9]+$/ && $3 ~ /^tests\/.*\.spec\.ts$/ {
            renamed[$2] = $3  # map old -> new
        }
        END {
            # Print only renamed targets
            for (old in renamed) {
                print renamed[old]
                delete added[old]  # remove original add
            }
            # Print adds that werent renamed
            for (file in added) {
                print file
            }
        }
        ' | sort -u)

    if [ -n "$new_files" ]; then
        file_count=$(printf '%s\n' "$new_files" | wc -l | tr -d ' ')
        while IFS= read -r file; do
            if [ -f "$file" ]; then
                test_count=$(grep -c "test(" "$file" 2>/dev/null)
                new_test_count=$((new_test_count + test_count))
            fi
        done <<< "$new_files"
    fi

    # Count `test(` occurrences in modified lines only (added lines in diffs), including renames
    modified_test_count=$(git log --since="$START_DATE" --until="$END_DATE" --author="$author" -p -- "tests/*.spec.ts" \
        | grep -cE '^\+.*test\(' )

    # Ensure values are numeric
    new_test_count=$((new_test_count + 0))
    modified_test_count=$((modified_test_count + 0))
    file_count=$((file_count + 0))

    # Only print authors with non-zero values
    if [[ $new_test_count -ne 0 || $modified_test_count -ne 0 || $file_count -ne 0 ]]; then
        # shellcheck disable=SC2059
        printf "$ROW_FMT" "$author" "$new_test_count" "$modified_test_count" "$file_count"

        # Update totals
        total_new_tests=$((total_new_tests + new_test_count))
        total_modified_tests=$((total_modified_tests + modified_test_count))
        total_files=$((total_files + file_count))
    fi
done

# Totals as a final table row (aligned with the same format string)
echo "$SEP"
# shellcheck disable=SC2059
printf "$ROW_FMT" "**Total**" "$total_new_tests" "$total_modified_tests" "$total_files"

echo ""
echo "**Done!**"
