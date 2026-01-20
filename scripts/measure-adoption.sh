#!/bin/bash
echo "=== DESIGN SYSTEM ADOPTION METRIC ==="

DS_IMPORTS=$(grep -r "from '@voxco/design-system" ./components ./contexts --include="*.tsx" 2>/dev/null | wc -l)
ADAPTER_IMPORTS=$(grep -r "from '@/adapters" ./components --include="*.tsx" 2>/dev/null | wc -l)
LEGACY_IMPORTS=$(grep -rE "from ['\"]\.\.?/components/(Button|TextField|Toggle)" ./components --include="*.tsx" 2>/dev/null | wc -l)
RELATIVE_DS=$(grep -rE "from ['\"]\.\..*packages/design-system" ./ --include="*.tsx" 2>/dev/null | wc -l)

MODERN=$((DS_IMPORTS + ADAPTER_IMPORTS))
TOTAL=$((MODERN + LEGACY_IMPORTS))

if [ $TOTAL -gt 0 ]; then
  PERCENTAGE=$((MODERN * 100 / TOTAL))
else
  PERCENTAGE=0
fi

echo "Imports from DS (@voxco/design-system): $DS_IMPORTS"
echo "Imports from Adapters (@/adapters):     $ADAPTER_IMPORTS"
echo "Legacy Imports (./components/*):        $LEGACY_IMPORTS"
echo "Relative DS Imports (FORBIDDEN):        $RELATIVE_DS"
echo "----------------------------------------"
echo "CURRENT ADOPTION: $PERCENTAGE%"
echo "TARGET:           85%"
