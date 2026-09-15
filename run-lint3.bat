@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsc -p tsconfig.lint.json --noEmit > lint-final3.txt 2>&1
echo __LINT3_DONE__>> lint-final3.txt