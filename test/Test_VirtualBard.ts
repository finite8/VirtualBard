/// <reference path="..\src\VirtualBard.ts" />"
/// <reference path="..\test\TestFramework.ts" />"
namespace VirtualBard {
    
    export function log(text: any)
    {
        console.log(text);
    }
    var myString = "balls balls and balls and stuff<test id=\"1\" others=\"5\">someother <innerTest></innerTest></test>";
    var r = findTag(myString, "test", { id: "1" });
   
    Assert.AreEqual("HTMLEdit Basic test", `balls balls and balls and stuff<test id="1" others="5">[Prepended]someother <innerTest>[SetText]</innerTest>[Appended]</test>`
        , r.appendText("[Appended]").prependText("[Prepended]").findTag("innerTest").setText("[SetText]").getText());
    class FunctionTests
    {
        TestCalendar = function () {
            let c = new VirtualBard.AdventureCalendar();
            Assert.AreEqual("DisplayText", "Midnight 1st of Hammer 0PR", c.CurrentDuration.GetDisplayText());
        }
    }
    Assert.TestClass(new FunctionTests());
}
