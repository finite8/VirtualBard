cmd /c tsc --target ES5 --experimentalDecorators src/VirtualBard test/TestFramework test/Test_VirtualBard --outFile bin/VirtualBard_Test.js
node bin\VirtualBard_Test.js