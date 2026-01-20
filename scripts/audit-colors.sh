#!/bin/bash
echo "=== AUDIT OF HARDCODED COLORS ==="

echo ""
echo "1. Tailwind classes with hardcoded colors:"
grep -rE "(bg|text|border|fill|stroke)-\[#[0-9a-fA-F]{3,6}\]" ./components ./contexts ./hooks \
  --include="*.tsx" --include="*.ts" 2>/dev/null \
  | sort | uniq -c | sort -rn

echo ""
echo "2. Inline style colors:"
grep -rE "(color|background|borderColor).*['\"]#[0-9a-fA-F]{3,6}" ./components \
  --include="*.tsx" --include="*.ts" 2>/dev/null \
  | sort | uniq -c | sort -rn

echo ""
TOTAL=$(grep -rE "#[0-9a-fA-F]{6}" ./components --include="*.tsx" 2>/dev/null | wc -l)
echo "TOTAL OCCURRENCES: $TOTAL"
