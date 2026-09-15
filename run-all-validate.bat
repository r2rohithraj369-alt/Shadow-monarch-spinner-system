@echo off
cd /d "%~dp0"
call npm.cmd run lint > lint-check.txt 2>&1
echo __LINT_END__ >> lint-check.txt
call npx.cmd tsx tests/criticalLogic.test.ts > tests-check.txt 2>&1
echo __TESTS_END__ >> tests-check.txt
call npm.cmd run build > build-check.txt 2>&1
echo __BUILD_END__ >> build-check.txt
exit /b 0
