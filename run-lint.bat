@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsc --noEmit > lint-final.txt 2>&1
echo __LINT_DONE__>> lint-final.txt