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
        TestDuration = function () {
            let d = new VirtualBard.Duration();
            Assert.AreEqual("Zero time", "Beginning", d.GetDisplayText());
            d.Hour = 1;
            Assert.AreEqual("One hour (no plural)", "1 hour", d.GetDisplayText());
            d.Hour = 2;
            Assert.AreEqual("Two hours (plural)", "2 hours", d.GetDisplayText());
            d.Day = 1;
            Assert.AreEqual("Two hours + 1 day","2 hours and 1 day", d.GetDisplayText());
            d.Week = 1;
            Assert.AreEqual("3 parts", "2 hours, 1 day and 1 week", d.GetDisplayText() );
            d.Month = 1;
            Assert.AreEqual("4 parts", "2 hours, 1 day, 1 week and 1 month", d.GetDisplayText() );
            d.Year = 1;
            Assert.AreEqual("5 parts", "2 hours, 1 day, 1 week, 1 month and 1 year", d.GetDisplayText() );
        }
        TestCalendar = function () {
            let c = new VirtualBard.AdventureCalendar();
            Assert.AreEqual("DisplayText", "Midnight 1st of Hammer 0PR", c.GetDisplayText());
            c.AddHours(1);
            Assert.AreEqual("DisplayText + 1hr", "Moondark 1st of Hammer 0PR", c.GetDisplayText());
            c.AddHours(24);
            Assert.AreEqual("DisplayText + 24hr", "Moondark 2nd of Hammer 0PR", c.GetDisplayText());
            c.SetTime(0);
            Assert.AreEqual("SetTime to 0", "Midnight 2nd of Hammer 0PR", c.GetDisplayText());
            c.StartNextDay();
            Assert.AreEqual("StartNextDay with default", "Dawn 3rd of Hammer 0PR", c.GetDisplayText());
            c.StartNextDay("Sunset")
            Assert.AreEqual("Sunset with default", "Sunset 4th of Hammer 0PR", c.GetDisplayText());
            Assert.AreEqual("Sunset Hour", 18, c.CurrentDuration.Hour);
            c.ProgressDayPortion();
            Assert.AreEqual("ProgressDayPortion", "Evening 4th of Hammer 0PR", c.GetDisplayText());
            c.AddHours(-24);
            Assert.AreEqual("Display Text - 24hr", "Evening 3rd of Hammer 0PR", c.GetDisplayText());
            settings.CalendarConfiguration.Start.Year = 1000;
            Assert.AreEqual("Display Text + 1000 year base", "Evening 3rd of Hammer 1000PR", c.GetDisplayText())
            settings.CalendarConfiguration.Start.Month = 6;
            Assert.AreEqual("Display Text + 6 month base", "Evening 3rd of Flamerule 1000PR", c.GetDisplayText())
            settings.CalendarConfiguration.Start.Week = 2;
            Assert.AreEqual("Display Text + 2 week base", "Evening 23rd of Flamerule 1000PR", c.GetDisplayText())
            settings.CalendarConfiguration.Start.Week = 3;
            Assert.AreEqual("Display Text + 3 week base", "Evening 3rd of Elesias 1000PR", c.GetDisplayText())
        }
    }
    Assert.TestClass(new FunctionTests());
}
