@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsx tests/criticalLogic.test.ts > final-tests.txt 2>&1
echo __TESTS_DONE__>> final-tests.txt
call npx tsx tests/bugfix-diagnostics.ts > final-diag.txt 2>&1
echo __DIAG_DONE__>> final-diag.txt
call npm run build > final-build.txt 2>&1
echo __BUILD_DONE__>> final-build.txt