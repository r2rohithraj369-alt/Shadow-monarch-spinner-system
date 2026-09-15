@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsc --noEmit > lint-final2.txt 2>&1
echo __LINT2_DONE__>> lint-final2.txt