@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsc --noEmit > lint-out.txt 2>&1
echo __LINT_DONE__>> lint-out.txt
call npx tsx tests/criticalLogic.test.ts > test-out.txt 2>&1
echo __TEST_DONE__>> test-out.txt
call npx tsx tests/bugfix-diagnostics.ts > diag-out.txt 2>&1
echo __DIAG_DONE__>> diag-out.txt
call npm run build > build-out.txt 2>&1
echo __BUILD_DONE__>> build-out.txt