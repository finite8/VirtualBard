cmd /c tsc --target ES5 src/VirtualBard src/VirtualBard_main --outFile bin/VirtualBard.js
copy bin\VirtualBard.js release\VirtualBard.js
copy doc\script.json release\script.json