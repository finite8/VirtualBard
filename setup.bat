@echo off
echo Installing Typescript
cmd /c npm install --save-dev typescript
echo Installing Typings
cmd /c npm install --save-dev typings
echo Installing Underscore Typings references
cmd /c typings install dt~underscore --global
set path > temp.txt
FindStr "Microsoft SDKs\TypeScript" temp.txt
IF %ERRORLEVEL% EQU 1 (
    echo Found 'Microsoft SDKs\TypeScript' in environment variables. This will cause issues when compiling typescript. Remove references to this path in your PATH environment variable to avoid this issue
) else (
    echo No environment variable errors found. You should be good to go.
)
del temp.txt