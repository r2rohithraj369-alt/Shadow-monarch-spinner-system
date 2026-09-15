@echo off
cd /d "%~dp0"
call npm.cmd run lint > lint-check.txt 2>&1
echo __LINT_END__ >> lint-check.txt
exit /b 0
