/// <reference path="../typings/globals/underscore/index.d.ts" />
module Assert
{
    class AssertionFailure extends Error
    {
        constructor(r: string)
        {
            super(r);
            this.reason = r;
        }
        public reason: string;
    }
    let passes : number = 0;
    let failures : number = 0;
    let scopes : ScopeEntry[] = [];
    export function PrintSummary()
    {
        console.log(`${passes} Tests Passed`);
        if (failures > 0)
        {
            console.log(`${failures} Tests FAILED!`);
        }
        else
        {
            console.log("No Failures");
        }
    }
    class ScopeEntry
    {
        constructor(typeToUse : ScopeType, nameToUse: string)
        {
            this.type = typeToUse;
            this.name = nameToUse;
        }
        public type: ScopeType;
        public name: string;
    }
    enum ScopeType
    {
        TestClass,
        TestClassFunction,
        AssertionDescription
    }
    function PrintFailure(result: string) : void
    {
        failures++;
        console.log("FAIL: " + GetScopedPath() + " REASON: " + result);
    }
    function ThrowFail(result: string) : void
    {
        failures++;
        
        var path = GetScopedPath();
        
        throw new AssertionFailure("FAIL: " + GetScopedPath() + " REASON: " + result);
        
    }
    function PrintAssertionPass(assertName: string) : void
    {
        PushAssertionNameScope(assertName);
        PrintPass();
        scopes.pop();
    }
    function PrintAssertionFailure(assertName: string, reason: string) : void
    {
        PushAssertionNameScope(assertName);
        PrintFailure(reason);
        scopes.pop();
    }
    function PrintPass() : void
    {
        passes++;
        console.log("PASS: " + GetScopedPath())
    }
    function PushAssertionNameScope(assertionName: string) : void
    {
        scopes.push(new ScopeEntry(ScopeType.AssertionDescription, assertionName));
    }
    function GetScopedPath() : string
    {
        let path : string = "";
        for (var i = 0; i < scopes.length; i++)
        {
            let curr = scopes[i];
            let next = i + 1 < scopes.length ? scopes[i + 1] : null;
            if (next == null)
            {
                path += curr.name;
            }
            else
            {
                if (next.type == ScopeType.AssertionDescription)
                {
                    path += curr.name + "=>";
                }
                else
                {
                    path += curr.name + ".";
                }
            }
        }
        return path;

    }
    export function Suite(suiteName: string, delegate: () => void) : void
    {
        console.log(`=== Starting test suite ${GetScopedPath()}`);
        try {
            delegate();
            console.log(`=== Test suite ${GetScopedPath()} Passed`)

        } catch (error) {
            if (typeof error !== 'AssertionFailure')
            {
                let err : Error = error;
                throw "!!! Suite '" + GetScopedPath() + "' Failed.\r\n" 
                + "Reason: " + err.message + "\r\n"
                + "StackTrace: " + err.stack;
            }
        }
    }
    export function IsTrue(descript: string, actual: boolean) : void
    {
        PushAssertionNameScope(descript);
        try
        {

        
            if (actual == true)
            {
                PrintPass();
            }
            else
            {
                ThrowFail("Expected TRUE actual " + actual);
            }
        }
        finally
        {
            scopes.pop();
        }
    }
    export function IsFalse(descript: string, actual: boolean) : void
    {
        PushAssertionNameScope(descript);
        try
        {

        
            if (actual == false)
            {
                PrintPass();
            }
            else
            {
                ThrowFail("Expected FALSE actual " + actual);
            }
        }
        finally
        {
            scopes.pop();
        }
    }
    export function AreEqual(descript: string, expected: any, actual: any) : void
    {
        PushAssertionNameScope(descript);
        try
        {
            if (expected === actual)
            {           
                PrintPass();
            }
            else
            {
                ThrowFail("Expected " + expected + ", Actual " + actual);
            }
        }
        finally
        {
            scopes.pop();
        }
    }
    export function TestClass(classToTest: any) : void
    {
        scopes.push(new ScopeEntry(ScopeType.TestClass, classToTest.constructor.name));
        let hasErrors = false;
        for (let p in classToTest)
        {
            var i = classToTest[p];
            if (typeof i === "function")
            {
                scopes.push(new ScopeEntry(ScopeType.TestClassFunction, p));
                let method : () => void = i;
                try
                {
                    Suite(p, method);
                    scopes.pop();
                }
                catch (e)
                {
                    
                    if (e.constructor.name !== 'AssertionFailure')
                    {
                        hasErrors = true;
                        PrintAssertionFailure(p, JSON.stringify(e));
                    }
                    scopes.pop();
                }
                
            }
        }
        scopes.pop();
        if (hasErrors)
        {
            throw "Test failed. See previous messages";
        }
    }
}