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
            c.AddHours(1);
            Assert.AreEqual("DisplayText + 1hr", "Moondark 1st of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            c.AddHours(24);
            Assert.AreEqual("DisplayText + 24hr", "Moondark 2nd of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            c.SetTime(0);
            Assert.AreEqual("SetTime to 0", "Midnight 2nd of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            c.StartNextDay();
            Assert.AreEqual("StartNextDay with default", "Dawn 3rd of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            c.StartNextDay("Sunset")
            Assert.AreEqual("Sunset with default", "Sunset 4th of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            Assert.AreEqual("Sunset Hour", 18, c.CurrentDuration.Hour);
            c.ProgressDayPortion();
            Assert.AreEqual("ProgressDayPortion", "Evening 4th of Hammer 0PR", c.CurrentDuration.GetDisplayText());
            c.AddHours(-24);
            Assert.AreEqual("Display Text - 24hr", "Evening 3rd of Hammer 0PR", c.CurrentDuration.GetDisplayText());
        }
    }
    Assert.TestClass(new FunctionTests());
}
