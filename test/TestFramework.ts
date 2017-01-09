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
    function PrintFailure(testName: string, result: string) : void
    {
        failures++;
        console.log("TF: ! " + testName + " !!!FAILED!!!: " + result);
    }
    function ThrowFail(testName: string, result: string) : void
    {
        failures++;
        throw new AssertionFailure("TF: ! " + testName + " !!!FAILED!!!: " + result);
    }
    function PrintPass(testName: string) : void
    {
        passes++;
        console.log("TF: " + testName + " passed.")
    }
    export function Suite(suiteName: string, delegate: () => void) : void
    {
        try {
            delegate();
        } catch (error) {
            if (typeof error !== 'AssertionFailure')
            {
                let err : Error = error;
                throw "Suite '" + suiteName + "' Failed.\r\n" 
                + "Reason: " + err.message + "\r\n"
                + "StackTrace: " + err.stack;
            }
        }
    }
    export function AreEqual(descript: string, expected: any, actual: any) : void
    {
        if (expected === actual)
        {
            PrintPass(descript);
        }
        else
        {
            ThrowFail(descript, "Expected " + expected + ", Actual " + actual);
        }
    }
    export function TestClass(classToTest: any) : void
    {
        let hasErrors = false;
        for (let p in classToTest)
        {
            var i = classToTest[p];
            if (typeof i === "function")
            {
                let method : () => void = i;
                try
                {
                    method();
                    PrintPass(p);
                }
                catch (e)
                {
                    if (e.constructor.name !== 'AssertionFailure')
                    {
                        hasErrors = true;
                        PrintFailure(p ,"TEST FAILED - " + p + "\r\n" 
                        + "Reason: " + JSON.stringify(e));
                    }
                }
            }
        }
        if (hasErrors)
        {
            throw "Test failed. See previous messages";
        }
    }
}