#!/bin/bash

SEARCH_DIR="tests"
OUTPUT_FILE="output/tag_totals.csv"

rm -rf "$OUTPUT_FILE" || true

# CSV header
echo "Tag,Total" > "$OUTPUT_FILE"

tag_list=()

while IFS= read -r line; do
  tag_list+=("$line")
done < <(
  grep -rho "tag: *\[[^]]*\]" "$SEARCH_DIR" --include="*.ts" | \
  sed -E 's/.*tag: *\[//' | \
  sed -E 's/\].*//' | \
  tr ',' '\n' | \
  sed -E "s/['\"]//g" | \
  sed -E 's/^\s+|\s+$//g' | \
  awk 'NF {print $0}' | \
  sort | uniq
)

# Markdown header
echo "| #  |        Tag         | Total TCs|"
echo "|----|--------------------|----------|"

# Loop through each tag
index=1
for tag in "${tag_list[@]}"; do
  clean_tag="${tag// /}"
  total=$(npx playwright test --project="Desktop Firefox" --grep "$clean_tag" --list 2>/dev/null | grep "Total: " | awk '{print $2}')
  total=${total:-0}  # default to 0 if empty
  echo "|$index|'$clean_tag|$total|" # Single-quoted tag for Excel copy-paste compatibility
  echo "'$clean_tag,$total" >> "$OUTPUT_FILE"
  ((index++))
done

echo "CSV generated: $OUTPUT_FILE"

total_tcs=$(npx playwright test --project="Desktop Firefox" --list 2>/dev/null | grep "Total: " | awk '{print $2}')
echo "Total Test Cases:" ${total_tcs}
