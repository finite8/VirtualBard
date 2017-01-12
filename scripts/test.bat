cmd /c tsc --target ES5 --module amd --allowJs --experimentalDecorators src/VirtualBard test/TestFramework test/Test_VirtualBard --outFile bin/VirtualBard_Test.js
node bin\VirtualBard_Test.js