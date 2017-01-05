module Assert
{
    export function Suite(suiteName: string, delegate: () => void) : void
    {
        try {
            delegate();
        } catch (error) {
            let err : Error = error;
            throw "Suite '" + suiteName + "' Failed.\r\n" 
            + "Reason: " + err.message + "\r\n"
            + "StackTrace: " + err.stack;
        }
    }
    export function AreEqual(expected: any, actual: any) : void
    {
        if (expected === actual)
        {

        }
        else
        {
            throw "Expected " + expected + ", Actual " + actual;
        }
    }
}