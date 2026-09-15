@echo off
cd /d "d:\Shadow monarch system\monarch-spinner-system (2)"
call npx tsc -p tsconfig.lint.json --noEmit > verify-lint.txt 2>&1
echo __LINT_DONE__>> verify-lint.txt
call npx tsx tests/criticalLogic.test.ts > verify-tests.txt 2>&1
echo __TESTS_DONE__>> verify-tests.txt
call npx tsx tests/bugfix-diagnostics.ts > verify-diag.txt 2>&1
echo __DIAG_DONE__>> verify-diag.txt
call npm run build > verify-build.txt 2>&1
echo __BUILD_DONE__>> verify-build.txt