/// <reference path="..\src\VirtualBard.ts" />"
/// <reference path="..\test\TestFramework.ts" />"
namespace VirtualBard {
    /**
     * Provides a Mock for the Roll20 log function
     */
    export function log(text: any)
    {
        console.log(text);
    }
    class Handler
    {
        EventType: string;
        Callbacks: any[];
    }
    let registeredHandlers : {event : string, callback : any}[] = [];
    export var state = {};
    /**
     * Provides a mock for the roll20 "on"" function
     */
    export function on(eventType: string, func: any) : void
    {
        registeredHandlers.push({
            event: eventType,
            callback: func
        });
    }

    function RaiseEvent(eventType: string, ...rest: any[]) : void
    {
        for (let i = 0; i < registeredHandlers.length; i++)
        {
            let h = registeredHandlers[i];
            if (h.event == eventType)
            {
                let f : () => void = h.callback;
                if (isAssigned(rest) && rest.length > 0)
                {
                    f();
                }
                else
                {
                    f.apply(this, rest);
                }
            }
        }
    }
    //Initialize();
    //RaiseEvent("ready");

    var myString = "balls balls and balls and stuff<test id=\"1\" others=\"5\">someother <innerTest></innerTest></test>";
    var r = findTag(myString, "test", { id: "1" });
   
    Assert.AreEqual("HTMLEdit Basic test", `balls balls and balls and stuff<test id="1" others="5">[Prepended]someother <innerTest>[SetText]</innerTest>[Appended]</test>`
        , r.appendText("[Appended]").prependText("[Prepended]").findTag("innerTest").setText("[SetText]").getText());
    class FunctionTests
    {
        TestDuration() {
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
        TestCalendar() {
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
        TestLocations() {
            LoadState();
            CurrentState.Calendar.AddHours(10);
            CurrentState.Location.NewLocation("Baldurs Gate");
            Assert.AreEqual("Root Location", "Baldurs Gate", CurrentState.Location.GetLocationPath());
            CurrentState.Calendar.AddHours(10);
            Assert.AreEqual("Location timespan", "10 hours", CurrentState.Location.CurrentLocation.GetDuration().GetDisplayText());
            Assert.AreEqual("Total duration = 20", 20, CurrentState.Calendar.CurrentDuration.Hour);
            CurrentState.Location.EnterSubLocation("Sewers");
            Assert.AreEqual("New sub location", "Sewers<=Baldurs Gate", CurrentState.Location.GetLocationPath());
            CurrentState.Calendar.AddHours(10);
            let left = CurrentState.Location.LeaveSubLocation();
            Assert.AreEqual("Left location", "Sewers", left.Name);
            Assert.AreEqual("10 hours at sub location", 10, left.GetDuration().Hour);
            Assert.AreEqual("Path back to root", "Baldurs Gate", CurrentState.Location.GetLocationPath());
            Assert.AreEqual("Total time at root is 20 hours", "20 hours", CurrentState.Location.CurrentLocation.GetDuration().GetDisplayText());
        }
    }
    Assert.TestClass(new FunctionTests());
}
