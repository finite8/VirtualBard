/// <reference path="..\src\VirtualBard.ts" />"
namespace VirtualBard {
    export function log(text: any)
    {
        console.log(text);
    }
    var myString = "balls balls and balls and stuff<test id=\"1\" others=\"5\">someother <innerTest></innerTest></test>";
    var r = findTag(myString, "test", { id: "1" });
    log(r);
    log(r.appendText("[Appended]").prependText("[Prepended]").findTag("innerTest").setText("[SetText]").getText());

}
