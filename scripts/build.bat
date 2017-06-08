cmd /c node node_modules\typescript\bin\tsc --target ES5 --experimentalDecorators src/VirtualBard_main_prefix src/VirtualBard src/VirtualBard_main --outFile bin/VirtualBard.js
copy bin\VirtualBard.js release\VirtualBard.js
copy doc\script.json release\script.json