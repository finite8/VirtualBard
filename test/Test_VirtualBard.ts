/// <reference path="..\src\VirtualBard.ts" />"

var myString = "balls balls and balls and stuff<test id=\"1\" others=\"5\">someother <innerTest></innerTest></test>";
var r = vb.findTag(myString, "test", { id: "1" });
log(r);
log(r.appendText("[Appended]").prependText("[Prepended]").findTag("innerTest").setText("[SetText]").getText());
