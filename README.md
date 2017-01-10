# VirtualBard
An adventure logging and helper script system for Roll20.

## Use this as a template for your own projects
Eventually, i will split this VSCode project out into its own template for anyone to use. Until then, you can repurpose my project for your own by doing the following:
### Windows
1. Download the entire project somewhere for you to use (don't bother forking)
2. Make sure you have VSCode installed: https://code.visualstudio.com/
3. If you haven't already, install Node.js from https://nodejs.org/en/
4. Run setup.bat. This will install:
..* Typescript Compiler
..* Typings to obtain definition files for underscore
..* Quickly checks to see if there is a common typescript problem in your path variables and instructs you to fix it.
5. Start VSCode and go File->Open Folder and find the folder you downloaded this project to
6. Replace any ts file with "Virtual Bard" with your own file (i.e: "VirtualBard.ts" with "MyThingy.ts")
7. Edit the bat files under the "scripts" folder. You will find references to the ts files (without the extension) and output js files. Replace these with the ones you have just created.
8. In vscode, i recomend you go to File->Preferences->Keyboard Shortcuts. Two windows will pop up. In the right one (the keybindings.json file in your user directory) add the following entry so it should look something like this:
'''json
// Place your key bindings in this file to overwrite the defaults
[
{
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.test",
    "when": "editorTextFocus"
}]
'''
Enjoy. I haven't tested these steps so let me know if it doesn't work or there are some modifications to the steps needed. If it all works right, you should be able to do the following:
* Ctrl+Shift+B will build the project and place all the files to go to roll20 in the release folder
* Ctrl+Shift+T will build and execute the tests.

I have provided a very basic testing framework. Im sure there are plenty of better JS testing frameworks out there, but this does what i need it to do in a nUnit-y kind of way. Don't judge me, i was lazy and CBF'd figuring out how to implement those other JS testing frameworks that all seem to want to spin up their own server isntance or something instead of just providing a simple assertion framework. Again, if im wrong, let me know. Happy to eat humble pie on this one.
