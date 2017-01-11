var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="Roll20typedef.d.ts" />
/// <reference path="../typings/globals/underscore/index.d.ts" />
/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var VirtualBard;
(function (VirtualBard) {
    // === DECORATORS ===
    var VBModuleInfo = (function () {
        function VBModuleInfo() {
            this.Commands = [];
            this.PostDelegates = [];
        }
        VBModuleInfo.prototype.GetCommandInfo = function (cmdText) {
            for (var i = 0; i < this.Commands.length; i++) {
                var cmd = this.Commands[i];
                if ("-" + cmd.Prefix == cmdText) {
                    return cmd;
                }
            }
            throw "No command found with prefix \"" + cmdText;
        };
        return VBModuleInfo;
    }());
    var VBModuleCommandInfo = (function () {
        function VBModuleCommandInfo() {
        }
        return VBModuleCommandInfo;
    }());
    var LoadedModules = [];
    function GetVBModuleForClass(className) {
        for (var i = 0; i < LoadedModules.length; i++) {
            var m = LoadedModules[i];
            if (m.Name == className) {
                return m;
            }
        }
        var newM = new VBModuleInfo();
        newM.Name = className;
        LoadedModules.push(newM);
        return newM;
    }
    function VBModule(modulePrefix) {
        return function (constructor) {
            //console.log(modulePrefix);
            //console.log(constructor);
            var m = GetVBModuleForClass(constructor.name); // cast to any to shut typescript up
            m.Prefix = modulePrefix;
            //console.log(JSON.stringify(LoadedModules));
        };
    }
    function VBModulePostAction() {
        return function (target, propertyKey, descriptor) {
            var m = GetVBModuleForClass(target.constructor.name);
            var postDel = descriptor.value;
            m.PostDelegates.push(postDel);
        };
    }
    function VBModuleCommand(commandText) {
        return function (target, propertyKey, descriptor) {
            //console.log(commandText);
            //console.log(target);
            //console.log(descriptor);
            var m = GetVBModuleForClass(target.constructor.name);
            var cmd = new VBModuleCommandInfo();
            cmd.Prefix = commandText;
            cmd.Delegate = descriptor.value;
            m.Commands.push(cmd);
            //console.log(JSON.stringify(LoadedModules));
        };
    }
    //  
    function Setup(completionCallback) {
        VirtualBard.on("ready", function () {
            var settingsHandout = p_sysFunctions.getHandout("VBSettings", true, false);
            settingsHandout.get("gmnotes", function (d) {
                try {
                    var tag = findTag(d, "Settings");
                    var setData = true;
                    var loadedSettings;
                    if (tag != null) {
                        loadedSettings = JSON.parse(tag.text);
                        if ((JSON.stringify(loadedSettings) != JSON.stringify({}))
                            && (loadedSettings != null)) {
                            setData = false;
                        }
                    }
                    if (setData) {
                        VirtualBard.settings = DefaultSettings();
                        setTimeout(function () {
                            var notes = JSON.stringify(VirtualBard.settings);
                            settingsHandout.set("gmnotes", "<Settings>" + notes + "</Settings>");
                            LoadState();
                            if (isAssigned(completionCallback)) {
                                completionCallback();
                            }
                        }, 100);
                    }
                    else {
                        VirtualBard.log("Existing: " + JSON.stringify(loadedSettings));
                        VirtualBard.settings = _.extend(DefaultSettings(), loadedSettings);
                        LoadState();
                        if (isAssigned(completionCallback)) {
                            completionCallback();
                        }
                        return;
                    }
                }
                catch (err) {
                    // we dont REALLY care about the error. we will however use it to indicate some kind of json error
                    VirtualBard.log("WARNING! Configuration error. Failed to parse custom settings data. Error: " + err.message);
                    VirtualBard.settings = DefaultSettings();
                }
            });
        });
    }
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Test"] = 0] = "Test";
        MessageType[MessageType["All"] = 1] = "All";
        MessageType[MessageType["Character"] = 2] = "Character";
    })(MessageType || (MessageType = {}));
    ;
    var CharacterMode;
    (function (CharacterMode) {
        /** A Character sheet is used to store information about the character. This is the ideal mode of operation */
        CharacterMode[CharacterMode["Sheet"] = 0] = "Sheet";
        /** A Handout is used to store character information. This will use the GM Notes to store JSON data and a HTML region in the notes to provide detail. */
        CharacterMode[CharacterMode["Handout"] = 1] = "Handout";
        /** A Single handout is used to store information for all characters encountered. GM Notes is used to store JSON data and a HTML region in the notes to provide detail. */
        CharacterMode[CharacterMode["SingleHandout"] = 2] = "SingleHandout";
    })(CharacterMode || (CharacterMode = {}));
    //   var messageTypes = {
    //     test : "test",
    //     character   : "Character Event"
    //   };
    var VBAttributes = {
        IsMet: "VB-IsMet"
    };
    function testCode() {
    }
    var DayTimeRange = (function () {
        function DayTimeRange() {
        }
        return DayTimeRange;
    }());
    var Duration = (function () {
        function Duration(basis) {
            this.Year = basis && basis.Year || 0;
            this.Month = basis && basis.Month || 0;
            this.Week = basis && basis.Week || 0;
            this.Day = basis && basis.Day || 0;
            this.Hour = basis && basis.Hour || 0;
        }
        Duration.nth = function (d) {
            if (d > 3 && d < 21)
                return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        /** Returns the equivlanet DatTimeRange for a given hour of the day */
        Duration.GetDayTimePortion = function (hour) {
            var useStartHour = hour == 24 ? 0 : hour;
            for (var i = 0; i < VirtualBard.settings.DayTimeRanges.length; i++) {
                var r = VirtualBard.settings.DayTimeRanges[i];
                if ((useStartHour >= r.StartHour) && (hour < r.EndHour || r.StartHour == r.EndHour)) {
                    return r;
                }
            }
            throw "No DayTimeRange was specified in settings for hour " + hour;
        };
        Duration.prototype.AddDuration = function (other) {
            this.Day += other.Day;
            this.Hour += other.Hour;
            this.Week += other.Week;
            this.Month += other.Month;
            this.Year += other.Year;
            this.BalanceTime();
        };
        /**
         * Subtracts one duration from another. Note: will not work well with negative results
         * @param {Duration} from: The Duration to have time taken away from
         * @param {Duration} take: The amount of time to take
         * i.e.: 5 - 1 = from - take = 4
         */
        Duration.GetDifference = function (from, take) {
            var toReturn = new Duration(from);
            toReturn.Day -= take.Day;
            toReturn.Hour -= take.Hour;
            toReturn.Week -= take.Week;
            toReturn.Month -= take.Month;
            toReturn.Year -= take.Year;
            toReturn.BalanceTime();
            return toReturn;
        };
        Duration.prototype.GetDisplayText = function () {
            var parts = [];
            if (this.Hour > 0) {
                var part = this.Hour + " hour";
                if (this.Hour > 1) {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Day > 0) {
                var part = this.Day + " day";
                if (this.Day > 1) {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Week > 0) {
                var part = this.Week + " week";
                if (this.Week > 1) {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Month > 0) {
                var part = this.Month + " month";
                if (this.Month > 1) {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Year > 0) {
                var part = this.Year + " year";
                if (this.Year > 1) {
                    part += "s";
                }
                parts.push(part);
            }
            if (parts.length == 0) {
                return "Beginning";
            }
            else {
                var retString = "";
                // we need to add commas inbetween all the parts, except for the last one. that gets an "and"
                for (var i = 0; i < parts.length; i++) {
                    retString += parts[i];
                    if (i < parts.length - 2) {
                        retString += ", ";
                    }
                    else if (i == parts.length - 2) {
                        retString += " and ";
                    }
                }
                return retString;
            }
        };
        Duration.prototype.BalanceTime = function () {
            // Hours
            while (this.Hour >= VirtualBard.settings.CalendarConfiguration.HoursInDay) {
                this.Hour -= VirtualBard.settings.CalendarConfiguration.HoursInDay;
                this.Day += 1;
            }
            while (this.Hour < 0) {
                this.Hour += VirtualBard.settings.CalendarConfiguration.HoursInDay;
                this.Day -= 1;
            }
            // Days
            while (this.Day >= VirtualBard.settings.CalendarConfiguration.DaysInWeek) {
                this.Day -= VirtualBard.settings.CalendarConfiguration.DaysInWeek;
                this.Week += 1;
            }
            while (this.Day < 0) {
                this.Day += VirtualBard.settings.CalendarConfiguration.DaysInWeek;
                this.Week -= 1;
            }
            // Weeks
            while (this.Week >= VirtualBard.settings.CalendarConfiguration.WeeksInMonth) {
                this.Week -= VirtualBard.settings.CalendarConfiguration.WeeksInMonth;
                this.Month += 1;
            }
            while (this.Week < 0) {
                this.Week += VirtualBard.settings.CalendarConfiguration.WeeksInMonth;
                this.Month -= 1;
            }
            // Months
            while (this.Month >= VirtualBard.settings.CalendarConfiguration.MonthsInYear) {
                this.Month -= VirtualBard.settings.CalendarConfiguration.MonthsInYear;
                this.Year += 1;
            }
            while (this.Month < 0) {
                this.Month += VirtualBard.settings.CalendarConfiguration.MonthsInYear;
                this.Year -= 1;
            }
        };
        return Duration;
    }());
    VirtualBard.Duration = Duration;
    var CalendarConfig = (function () {
        function CalendarConfig() {
        }
        return CalendarConfig;
    }());
    /** A calendar that provides specific logic. This is designed to work with the D&D calendar, but could be expanded for other calendar systems  */
    var AdventureCalendar = (function () {
        function AdventureCalendar() {
            this.CurrentDuration = new Duration();
        }
        AdventureCalendar.prototype.AddHours = function (hours) {
            this.CurrentDuration.Hour += hours;
            this.CurrentDuration.BalanceTime();
        };
        AdventureCalendar.prototype.GetDisplayText = function () {
            var useDuration = new Duration(VirtualBard.settings.CalendarConfiguration.Start);
            useDuration.AddDuration(this.CurrentDuration);
            var port = Duration.GetDayTimePortion(useDuration.Hour);
            var diff = useDuration.Hour - port.StartHour;
            var hourPortionText = diff == 0 ? "" : diff + " hours after ";
            var dayPart = (useDuration.Day + 1) + (useDuration.Week * VirtualBard.settings.CalendarConfiguration.DaysInWeek);
            return "" + hourPortionText + port.Name
                + " " + (dayPart) + Duration.nth(dayPart)
                + " of " + VirtualBard.settings.CalendarConfiguration.MonthNames[useDuration.Month]
                + " " + useDuration.Year + VirtualBard.settings.CalendarConfiguration.YearSuffix;
        };
        /** Progresses the day to the next time period (i.e: Dawn -> Morning). This will progress through to the next day */
        AdventureCalendar.prototype.ProgressDayPortion = function () {
            var currentPortion = Duration.GetDayTimePortion(this.CurrentDuration.Hour);
            this.AddHours(currentPortion.EndHour - this.CurrentDuration.Hour);
        };
        /** Sets the current hour in the day to a different time. Will not progress to the next day*/
        AdventureCalendar.prototype.SetTime = function (hour) {
            this.CurrentDuration.Hour = hour;
            this.CurrentDuration.BalanceTime();
        };
        /** Moves to the next day. If portion is not provided, hour will be set to 6 (default: dawn)*/
        AdventureCalendar.prototype.StartNextDay = function (portion) {
            this.CurrentDuration.Day += 1;
            if (isAssigned(portion)) {
                for (var i = 0; i < VirtualBard.settings.DayTimeRanges.length; i++) {
                    var r = VirtualBard.settings.DayTimeRanges[i];
                    if (r.Name.toLowerCase() == portion.toLowerCase()) {
                        this.CurrentDuration.Hour = r.StartHour;
                        this.CurrentDuration.BalanceTime();
                        return;
                    }
                }
                throw "Day portion " + portion + " not recognized";
            }
            // if we got this far, portion was not declared, so just move to 6am.
            this.CurrentDuration.Hour = 6;
            this.CurrentDuration.BalanceTime();
        };
        return AdventureCalendar;
    }());
    VirtualBard.AdventureCalendar = AdventureCalendar;
    var CharacterFindResult = (function () {
        function CharacterFindResult() {
        }
        return CharacterFindResult;
    }());
    var UserContext = (function () {
        function UserContext(playerId, userName) {
            this.PlayerId = playerId;
            this.UserName = userName;
        }
        UserContext.prototype.SendChat = function (text) {
            sendMessage(this.UserName, text);
        };
        return UserContext;
    }());
    /**
     * The location info provides an individual entry for location history.
     */
    var LocationInfo = (function () {
        function LocationInfo() {
        }
        /** Gets the total duration at this location (current time minus time of arrival) */
        LocationInfo.prototype.GetDuration = function () {
            return Duration.GetDifference(VirtualBard.CurrentState.Calendar.CurrentDuration, this.ArrivalDuration);
        };
        return LocationInfo;
    }());
    var LocationManager = (function () {
        function LocationManager() {
            this.CurrentLocation = new LocationInfo();
            this.CurrentLocation.Name = "An unknown location";
            this.CurrentLocation.ArrivalDuration = new Duration();
        }
        /** Returns a simple path of the current location. Useful for informative purposes */
        LocationManager.prototype.GetLocationPath = function () {
            var loc = this.CurrentLocation;
            if (!isAssigned(loc)) {
                return "Location not specified";
            }
            else {
                var retStr = loc.Name;
                while (loc != null) {
                    loc = loc.ParentLocation;
                    if (loc != null) {
                        retStr += "<=" + loc.Name;
                    }
                }
                return retStr;
            }
        };
        LocationManager.prototype.NewLocation = function (locationName) {
            this.CurrentLocation = new LocationInfo();
            this.CurrentLocation.ArrivalDuration = new Duration(VirtualBard.CurrentState.Calendar.CurrentDuration);
            this.CurrentLocation.Name = locationName;
        };
        LocationManager.prototype.EnterSubLocation = function (locationName) {
            if (!isAssigned(this.CurrentLocation)) {
                throw "Cannot enter a sub location without specifing an overall location first";
            }
            else {
                var newLoc = new LocationInfo();
                newLoc.ArrivalDuration = new Duration(VirtualBard.CurrentState.Calendar.CurrentDuration);
                newLoc.Name = locationName;
                newLoc.ParentLocation = this.CurrentLocation;
                this.CurrentLocation = newLoc;
            }
        };
        /**
         * Leaves a sub location if possible, throws otherwise.
         * @returns {LocationInfo} The name of the sub location that was left.
         */
        LocationManager.prototype.LeaveSubLocation = function () {
            if (!isAssigned(this.CurrentLocation) || (this.CurrentLocation.ParentLocation == null)) {
                throw "Cannot leave a sub location without being in one first";
            }
            var oldLoc = this.CurrentLocation;
            this.CurrentLocation = this.CurrentLocation.ParentLocation;
            return oldLoc;
        };
        return LocationManager;
    }());
    /** The adventure state is designed to manage the current progress of the adventure. This can be interacted by specific Commands
     * and other elements of VirtualBard will use this to log more specific information
     */
    var AdventureState = (function () {
        function AdventureState() {
            this.Calendar = new AdventureCalendar();
            this.Location = new LocationManager();
        }
        return AdventureState;
    }());
    function LoadState() {
        VirtualBard.CurrentState = new AdventureState();
        if (isAssigned(VirtualBard.state.VirtualBardState)) {
            _.extend(VirtualBard.CurrentState, VirtualBard.state.VirtualBardState);
        }
    }
    VirtualBard.LoadState = LoadState;
    function SaveState() {
        VirtualBard.state.VirtualBardState = VirtualBard.CurrentState;
    }
    /**
     * This is a core Character data container. This stores all of the core character data properties. It is up the the individual
     * reference implementation to store the data in its respecive container.
     * This contains the core properties of character data, but more can be added at any time. In no way
     * should data storage be limited to the properties defined here.
     */
    var CharacterData = (function () {
        function CharacterData() {
        }
        CharacterData.prototype.SetProperty = function (propName, value) {
            // we will do a case insensitive search first
            for (var i in this) {
                if (this.hasOwnProperty(i) && (i.toLowerCase() == propName.toLowerCase())) {
                    this[i] = value;
                    return;
                }
            }
            this[propName] = value;
        };
        CharacterData.prototype.GetProperty = function (propName) {
            // we will do a case insensitive search first
            for (var i in this) {
                if (this.hasOwnProperty(i) && (i.toLowerCase() == propName.toLowerCase())) {
                    return this[i];
                }
            }
            var result = this[propName];
            if (isAssigned(result)) {
                return (result);
            }
            else {
                return null;
            }
        };
        return CharacterData;
    }());
    /**
     * As character containers can take several forms (Character sheets, Handout sheets, or nothing), this is used
     * to abstract that behaviour accordingly.
     */
    var CharacterReferenceBase = (function () {
        function CharacterReferenceBase() {
            this.Data = new CharacterData();
        }
        /** By default, this will retrieve values from the CharacterData object. This can be overidden by other implementations to do more fancy things */
        CharacterReferenceBase.prototype.GetAttribute = function (attribName) {
            return this.Data.GetProperty(attribName);
        };
        CharacterReferenceBase.prototype.SetAttribute = function (attribName, attribValue) {
            var savedValue = this.AssignAttributeValue(attribName, attribValue);
            this.Data.SetProperty(attribName, savedValue);
            this.SaveData(this.Data);
        };
        return CharacterReferenceBase;
    }());
    /**
     * A character that has their own character sheet to store their information.
     */
    var CharacterSheetReference = (function (_super) {
        __extends(CharacterSheetReference, _super);
        function CharacterSheetReference(char) {
            var _this = _super.call(this) || this;
            _this.CharSheet = char;
            _this.LoadData();
            return _this;
        }
        CharacterSheetReference.prototype.LoadData = function () {
            var refObj = this;
            this.CharSheet.get("gmnotes", function (t) {
                var tag = findTag(t, "CharData");
                if (tag != null) {
                    var jData = JSON.parse(tag.text);
                    _.extend(refObj.Data, jData);
                    // We need to enumerate all of the properties defined in the character
                    for (var pName in refObj.Data) {
                        if (refObj.Data.hasOwnProperty(pName)) {
                            refObj.Data[pName] = p_sysFunctions.getCharacterAttribute(refObj.CharSheet, pName);
                        }
                    }
                }
            });
        };
        CharacterSheetReference.prototype.SaveData = function (data) {
            var refObj = this;
            this.CharSheet.get("gmnotes", function (t) {
                var htmlEdt = findTag(t, "CharData").setText(JSON.stringify(refObj.Data));
                setTimeout(function () {
                    refObj.CharSheet.set("gmnotes", htmlEdt.getText());
                }, 100);
            });
        };
        CharacterSheetReference.prototype.AssignAttributeValue = function (attribName, attribValue) {
            p_sysFunctions.setCharacterAttribute(this.CharSheet, attribName, attribValue);
            return attribValue;
        };
        return CharacterSheetReference;
    }(CharacterReferenceBase));
    // class CharacterHandoutReference extends CharacterReferenceBase
    // {
    //     constructor()
    // }
    var TextPointer = (function () {
        function TextPointer() {
        }
        return TextPointer;
    }());
    var HTMLTextEditor = (function () {
        function HTMLTextEditor() {
        }
        HTMLTextEditor.prototype.getText = function () { return this.originalText.value; };
        HTMLTextEditor.prototype.findTag = function (subTag, subAttributes) {
            return findTag(this.text, subTag, subAttributes, this);
        };
        HTMLTextEditor.prototype.appendText = function (textToAppend) {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerEndIndex) + textToAppend + txtToModify.slice(this.innerEndIndex);
            this.innerEndIndex += textToAppend.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        };
        HTMLTextEditor.prototype.setText = function (textToSet) {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToSet + txtToModify.slice(this.innerEndIndex);
            this.innerEndIndex = this.innerStartIndex + textToSet.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        };
        HTMLTextEditor.prototype.prependText = function (textToPrepend) {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToPrepend + txtToModify.slice(this.innerStartIndex);
            this.innerEndIndex += textToPrepend.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        };
        HTMLTextEditor.prototype.appendTag = function (tagToAppend) {
            var edt = this.appendText("<" + tagToAppend + "></" + tagToAppend + ">");
            return edt.findTag(tagToAppend);
        };
        return HTMLTextEditor;
    }());
    function DefaultSettings() {
        return {
            sexTypes: expand({
                "m,male": "Male",
                "f,female": "Female"
            }),
            classTypes: expand({
                "fighter": "Fighter",
                "barb,barbarian": "Barbarian",
                "bard": "Bard",
                "cleric": "Cleric",
                "druid,hippie": "Druid",
                "monk": "Monk",
                "paladin": "Paladin",
                "ranger": "Ranger",
                "rogue,thief": "Rogue",
                "sorcerer,sorc": "Sorcerer",
                "wizard,wiz": "Wizard",
                "warlock,lock": "Warlock"
            }),
            CharacterResolutionOrder: //{mode : CharacterMode, canCreate : boolean}[] = 
            [{ mode: CharacterMode.Sheet, canCreate: false } // attempt to find a sheet first
                ,
                { mode: CharacterMode.Handout, canCreate: false } // then try to find a handout
                ,
                { mode: CharacterMode.SingleHandout, canCreate: false } // then try to find a single handout
                ,
                { mode: CharacterMode.Sheet, canCreate: true } // otherwise, fall back and create the character sheet
            ],
            AdventureLog: "Adventure Log",
            CalendarConfiguration: {
                HoursInDay: 24,
                DaysInWeek: 10,
                WeeksInMonth: 3,
                MonthsInYear: 12,
                Start: new Duration(),
                YearSuffix: "PR",
                MonthNames: ["Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn", "Flamerule", "Elesias", "Eleint", "Marpenoth", "Uktar", "Nightal"]
            },
            DayTimeRanges: [
                { Name: "Dawn", StartHour: 6, EndHour: 7 },
                { Name: "Morning", StartHour: 7, EndHour: 12 },
                { Name: "Highsun", StartHour: 12, EndHour: 13 },
                { Name: "Afternoon", StartHour: 13, EndHour: 17 },
                { Name: "Dusk", StartHour: 17, EndHour: 18 },
                { Name: "Sunset", StartHour: 18, EndHour: 19 },
                { Name: "Evening", StartHour: 19, EndHour: 24 },
                { Name: "Midnight", StartHour: 0, EndHour: 1 },
                { Name: "Moondark", StartHour: 1, EndHour: 6 }
            ]
        };
    }
    ;
    VirtualBard.settings = DefaultSettings();
    /**
     *  returns a object that describes the results. The returned object supports additional searcing and text modification functions.
     */
    function findTag(baseText, tag, attributes, basis) {
        var regString = "(<" + tag + "(\\b[^>]*)>)([\\s\\S]*?)(<\\\/" + tag + ">)";
        var r = new RegExp(regString, "gim");
        var match = r.exec(baseText);
        if (match == null) {
            //log("no match");
            return null;
        }
        if (isAssigned(attributes)) {
            // lets go through each property pair.
            for (var p in attributes) {
                if (attributes.hasOwnProperty(p)) {
                    var attribReg = new RegExp(p + "=\"" + attributes[p] + "\"");
                    if (attribReg.exec(match[2]) == null) {
                    }
                }
            }
        }
        // if we have gotten this far, we have a positive match. lets keep going.
        var offset;
        var useOriginalText;
        if (isAssigned(basis)) {
            offset = basis.innerStartIndex;
            useOriginalText = basis.originalText;
        }
        else {
            offset = 0;
            useOriginalText = { value: baseText };
        }
        var result = new HTMLTextEditor();
        result.originalText = useOriginalText;
        result.tagAttributes = match[2];
        result.tag = tag;
        result.endTag = match[4];
        result.text = match[3];
        result.startIndex = match.index + offset;
        result.innerStartIndex = match.index + match[1].length + offset;
        result.innerEndIndex = (match.index + match[0].length - match[4].length) + offset;
        result.endIndex = match.index + match[0].length + offset;
        //log(result);
        return result;
    }
    VirtualBard.findTag = findTag;
    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }
    function isAssigned(obj) {
        return obj != null && typeof obj !== 'undefined';
    }
    VirtualBard.isAssigned = isAssigned;
    function assertVariableAssigned(obj, varName) {
        if (!isAssigned(obj)) {
            if (obj == null) {
                throw varName + " cannot be NULL";
            }
            else if (typeof obj == 'undefined') {
                throw varName + " was not defined";
            }
            else {
                throw varName + " was invalid";
            }
        }
    }
    function isAnyDefined() {
        var toTest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            toTest[_i] = arguments[_i];
        }
        for (var i = 0; i < toTest.length; i++) {
            if (isDefined(toTest[i])) {
                return true;
            }
        }
        return false;
    }
    function expand(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i], subkeys = key.split(/,\s?/), target = obj[key];
            delete obj[key];
            subkeys.forEach(function (key) { obj[key] = target; });
        }
        return obj;
    }
    var MessageInfo = (function () {
        function MessageInfo() {
        }
        return MessageInfo;
    }());
    var MessageCommand = (function () {
        function MessageCommand() {
            this.Params = [];
        }
        return MessageCommand;
    }());
    function parseMessage(msg) {
        var result = new MessageInfo();
        if (msg.type != "api") {
            result.IsValid = false;
            return result;
        }
        var found = false;
        for (var i_1 = 0; i_1 < LoadedModules.length; i_1++) {
            var m = LoadedModules[i_1];
            if (msg.content.indexOf("!" + m.Prefix) == 0) {
                result.Module = m;
                found = true;
                break;
            }
        }
        if (!found) {
            result.IsValid = false;
            return result;
        }
        // if (msg.content.indexOf("!h") == 0) {
        //     result.IsHelp = true;
        //     result.Type = MessageType.All;
        // }
        // else if (msg.content.indexOf("!c") == 0) {
        //     result.Type = MessageType.Character;
        // }
        // else if (msg.content.indexOf("!test") == 0) {
        //     result.Type = MessageType.Test;
        // }
        // else {
        //     result.IsValid = false;
        //     return result;
        // }
        result.IsValid = true;
        result.UserContextId = msg.playerid;
        result.UserName = msg.who;
        var cmd = new MessageCommand();
        result.Commands = [];
        // we now search for the next '-' starting element.
        var parts = msg.content.trim().split(" ");
        var index = 1;
        var addedSomething = false;
        for (var i = index; i < parts.length; i++) {
            var part = parts[i];
            if (part.indexOf("-") == 0) {
                // we have a command initiator
                if (addedSomething) {
                    result.Commands.push(cmd);
                    cmd = new MessageCommand();
                    cmd.Type = part;
                    addedSomething = false;
                }
                else {
                    cmd.Type = part;
                }
            }
            else {
                cmd.Params.push(part);
                addedSomething = true;
            }
        }
        if (addedSomething) {
            result.Commands.push(cmd);
        }
        VirtualBard.log(result);
        return result;
    }
    function processAction(user, data) {
    }
    function sendMessage(user, message) {
        sendChat("Virtual Bard", "/w " + user + " " + message);
    }
    function broadcastMessage(message) {
        sendChat("Virtual Bard", message);
    }
    function getUserContext(msg) {
        var ctx = contextStore[msg.playerid];
        if (typeof ctx == 'undefined') {
            ctx = new UserContext(msg.playerid, msg.who);
            contextStore[msg.playerid] = ctx;
        }
        return ctx;
    }
    function printRootHelp(data) {
    }
    function process(context, data) {
        context.Current = {};
        //let processingFunction: (ctx: UserContext, cmd: MessageCommand) => void;
        var postAction;
        // switch (data.Type) {
        //     case MessageType.Character:
        //         if (data.IsHelp) {
        //             printJournalHelp(data);
        //         }
        //         else {
        //             context.Current.SentenceParts = {};
        //             processingFunction = function (ctx, cmd) { processCharacterAction(ctx, cmd) };
        //             postAction = function (ctx) { p_characterFunctions.logResults(ctx) };
        //         }
        //         break;
        //     case MessageType.Test:
        //         testCode();
        //         break;
        //     default:
        //         throw "Command " + data.Type + " not implemented";
        // }
        //if (typeof processingFunction !== 'undefined') {
        var errors = [];
        for (var i = 0; i < data.Commands.length; i++) {
            try {
                var cmd = data.Commands[i];
                var cmdInfo = data.Module.GetCommandInfo(cmd.Type);
                cmdInfo.Delegate(context, cmd);
            }
            catch (er) {
                if (typeof er == "Error") {
                    var err = er;
                    errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + err.message + ", stack=" + err.stack);
                }
                else {
                    errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + er);
                }
            }
        }
        for (var i_2 = 0; i_2 < data.Module.PostDelegates.length; i_2++) {
            data.Module.PostDelegates[i_2](context);
        }
        // if (isDefined(postAction)) {
        //     postAction(context);
        // }
        if (errors.length > 0) {
            throw "Following errors were encountered:\r\n" + errors.join("\r\n");
        }
        //}
    }
    var CharacterFunctions = CharacterFunctions_1 = (function () {
        function CharacterFunctions() {
        }
        CharacterFunctions.prototype.logAction = function (ctx) {
            var sp = ctx.Current.SentenceParts;
            if (isDefined(sp) && isDefined(sp.Name)) {
                var sent = "";
                sent = sent + "The party met [" + sp.Name + "]";
                if (isAnyDefined(sp.Race, sp.Sex, sp.Class)) {
                    sent = sent + ", a";
                    if (isDefined(sp.Sex)) {
                        sent = sent + " " + sp.Sex;
                    }
                    if (isDefined(sp.Race)) {
                        sent = sent + " " + sp.Race;
                    }
                    if (isDefined(sp.Class)) {
                        sent = sent + " " + sp.Class;
                    }
                }
                sent = sent + ".";
                p_journalFunctions.appendJournalLine(sent);
            }
        };
        CharacterFunctions.prototype.whoAction = function (ctx, cmd) {
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.getCharacterInfo(charName);
            if (isDefined(r)) {
                // we have the character
                ctx.CurrentChar = r.Char;
                ctx.SendChat("Character context set to: " + r.Char.GetAttribute("Name"));
            }
            else {
                ctx.SendChat("No character exists with name: " + charName);
            }
        };
        CharacterFunctions.prototype.metAction = function (ctx, cmd) {
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.getCharacterInfo(charName);
            VirtualBard.log("Char Info: " + r);
            if (!r.IsNew) {
                sendMessage(ctx.UserName, "The party is already aware of " + charName);
            }
            else {
            }
            ctx.Current.SentenceParts.Name = charName;
            ctx.CurrentChar = r.Char;
        };
        CharacterFunctions.prototype.classAction = function (ctx, cmd) {
            CharacterFunctions_1.assertCurrentCharDefined(ctx, cmd);
            var realClass = VirtualBard.settings.classTypes[cmd.Params[0].toLowerCase()];
            if (!isDefined(realClass)) {
                ctx.SendChat("Class " + cmd.Params[0] + " could not be resolved to a real class. Character sheet will resort to a default instead");
                ctx.Current.SentenceParts.Class = cmd.Params[0];
                realClass = "";
            }
            else {
                ctx.Current.SentenceParts.Class = realClass;
            }
            ctx.CurrentChar.SetAttribute("class", realClass);
            ctx.CurrentChar.SetAttribute("inputClass", cmd.Params[0]);
        };
        CharacterFunctions.prototype.sexAction = function (ctx, cmd) {
            CharacterFunctions_1.assertCurrentCharDefined(ctx, cmd);
            var sex = CharacterFunctions_1.parseSex(cmd.Params[0]);
            ctx.Current.SentenceParts.Sex = sex;
            ctx.CurrentChar.SetAttribute("sex", sex);
        };
        CharacterFunctions.prototype.raceAction = function (ctx, cmd) {
            CharacterFunctions_1.assertCurrentCharDefined(ctx, cmd);
            ctx.Current.SentenceParts.Race = cmd.Params.join(" ");
            ctx.CurrentChar.SetAttribute("race", ctx.Current.SentenceParts.Race);
        };
        CharacterFunctions.parseSex = function (text) {
            var sex = VirtualBard.settings.sexTypes[text.toLowerCase()];
            if (typeof sex == 'undefined') {
                throw text + " could not be interpreted as a valid sex";
            }
            return sex;
        };
        CharacterFunctions.assertCurrentCharDefined = function (ctx, cmd) {
            if (typeof ctx.CurrentChar == 'undefined') {
                throw cmd.Type + " requires a Character context to be set";
            }
        };
        return CharacterFunctions;
    }());
    __decorate([
        VBModulePostAction()
    ], CharacterFunctions.prototype, "logAction", null);
    __decorate([
        VBModuleCommand("who")
    ], CharacterFunctions.prototype, "whoAction", null);
    __decorate([
        VBModuleCommand("met")
    ], CharacterFunctions.prototype, "metAction", null);
    __decorate([
        VBModuleCommand("c")
    ], CharacterFunctions.prototype, "classAction", null);
    __decorate([
        VBModuleCommand("s")
    ], CharacterFunctions.prototype, "sexAction", null);
    __decorate([
        VBModuleCommand("r")
    ], CharacterFunctions.prototype, "raceAction", null);
    CharacterFunctions = CharacterFunctions_1 = __decorate([
        VBModule("c")
    ], CharacterFunctions);
    var p_journalFunctions = {
        currentSentence: "",
        appendJournalText: function (text) {
            this.currentSentence = this.currentSentence + text;
            var j = this.getJournalHandout();
            j.get("notes", function (n) {
                VirtualBard.log("Existing Notes:" + n);
                setTimeout(function () {
                    j.set("notes", n + text);
                }, 100);
            });
            //j.notes = (j.notes || "") + text;
            VirtualBard.log("Writting to log:" + text);
        },
        appendJournalLine: function (text) {
            this.appendJournalText(text + "<br>");
            this.finishSentence();
        },
        finishSentence: function () {
            if (this.currentSentence !== "") {
                broadcastMessage(this.currentSentence);
                this.currentSentence = "";
            }
        },
        getJournalHandout: function () {
            if (typeof this.journalHandout !== 'undefined') {
                return this.journalHandout;
            }
            var handouts = VirtualBard.findObjs({ _type: "handout", name: VirtualBard.settings.AdventureLog });
            if (handouts.length == 0) {
                var h = VirtualBard.createObj("handout", { name: VirtualBard.settings.AdventureLog, inplayerjournals: "all", controlledby: "all", notes: "" });
                this.journalHandout = h;
            }
            else {
                VirtualBard.log("found existing");
                this.journalHandout = handouts[0];
            }
            this.appendJournalLine(new Date(Date.now()).toLocaleString());
            return this.journalHandout;
        }
    };
    var p_sysFunctions = {
        getSafeCharacterName: function (charName) {
            return "_vb_c:" + charName;
        },
        /** Gets or Creates a handout with the specified name. */
        getHandout: function (handoutName, isHidden, isEditable) {
            var hos = VirtualBard.findObjs({ _type: "handout", name: handoutName });
            VirtualBard.log(hos);
            if (isAssigned(hos) && hos.length > 0) {
                return hos[0];
            }
            else {
                var inplayerjournalsStr = void 0;
                if (isHidden) {
                    inplayerjournalsStr = "";
                }
                else {
                    inplayerjournalsStr = "all";
                }
                var isEditableStr = void 0;
                if (isEditable) {
                    isEditableStr = "all";
                    inplayerjournalsStr = "all";
                }
                else {
                    isEditableStr = "";
                }
                return VirtualBard.createObj("handout", { name: handoutName, inplayerjournals: inplayerjournalsStr, controlledby: isEditableStr });
            }
        },
        findCharacterSheet: function (charName) {
            var shts = VirtualBard.findObjs({ _type: "character", name: charName });
            VirtualBard.log(shts);
            if (shts.length == 0) {
                return null;
            }
            else {
                return shts[0];
            }
        },
        /**
         * Resolves the Character info reference. This will return different things based on the mode of operation
         */
        getCharacterInfo: function (charName) {
            for (var i = 0; i < VirtualBard.settings.CharacterResolutionOrder.length; i++) {
                var m = VirtualBard.settings.CharacterResolutionOrder[i];
                VirtualBard.log("Attmepting to resolve character '" + charName + "' using mode '" + CharacterMode[m.mode] + "'");
                switch (m.mode) {
                    case CharacterMode.Sheet:
                        var char = this.findCharacterSheet(charName);
                        var isNew = void 0;
                        if (char == null) {
                            VirtualBard.log("Could not find Character sheet for " + charName);
                            if (m.canCreate) {
                                VirtualBard.log("Creating...");
                                char = VirtualBard.createObj("character", { name: charName, inplayerjournals: "all", controlledby: "all" });
                                this.setCharacterAttribute(char, VBAttributes.IsMet, true);
                                isNew = true;
                            }
                            else {
                                VirtualBard.log("canCreate=false. Continuing...");
                                continue;
                            }
                        }
                        else {
                            VirtualBard.log("Found!");
                            isNew = !(this.getCharacterAttribute(char, VBAttributes.IsMet) == true);
                        }
                        var ret = new CharacterFindResult();
                        ret.IsNew = isNew;
                        ret.Char = new CharacterSheetReference(char);
                        return ret;
                    default:
                        VirtualBard.log("CharacterSheetMode " + m + " is not yet implemented");
                }
            }
            throw "VirtualBard was unable to resolve the character " + charName + ". Try adding more ResolutionOptions or allowing VirtualBard to create sheets or handouts.";
        },
        getCharacterAttribute: function (char, attribName) {
            assertVariableAssigned(char, "char");
            if (!isDefined(char.id)) {
                VirtualBard.log(char);
                throw "id was undefined on char parameter";
            }
            var result = getAttrByName(char.id, attribName);
            return result;
        },
        setCharacterAttribute: function (char, attribName, newValue) {
            var attribs = VirtualBard.findObjs({ _type: "attribute", _characterid: char.id, name: attribName });
            VirtualBard.log("setting attribute");
            VirtualBard.log(char);
            //log(findObjs({_type:"attribute", _characterid:char.id}));
            if (attribs.length == 0) {
                // we instead need to insert it
                var newAttrib = VirtualBard.createObj("attribute", { name: attribName, current: newValue, characterid: char.id });
                VirtualBard.log("Inserting attribute" + attribName);
            }
            else if (attribs.length > 1) {
                throw attribs.length + " attributes discovered with name " + attribName;
            }
            else {
                attribs[0].current = newValue;
            }
        }
    };
    var contextStore = {};
    function Initialize() {
        Setup(function () {
            VirtualBard.on("chat:message", function (msg) {
                VirtualBard.log(msg);
                //try
                //{
                if (msg.indexOf("!vb DUMP") == 0) {
                    DumpEnvironment();
                }
                else {
                    var r = parseMessage(msg);
                    if (r.IsValid) {
                        var ctx = getUserContext(msg);
                        // we have a command and a context to work with. lets start processing.
                        process(ctx, r);
                        SaveState();
                    }
                }
                //}
                //catch (err)
                //{
                //    log(err);
                //    ctx.SendChat("Invalid command: " + err.message);
                //}
            });
        });
    }
    VirtualBard.Initialize = Initialize;
    ;
    function DumpEnvironment() {
        VirtualBard.log("========= DUMPING ENVIRONMENT ===========");
        VirtualBard.log("======= BEGIN GAME STATE =========");
        VirtualBard.log(JSON.stringify(VirtualBard.state));
        VirtualBard.log("======= BEGIN VIRTUALBARD ENVIRONMENT =========");
        VirtualBard.log(this);
        VirtualBard.log("========= END DUMP ===========");
        VirtualBard.log("If you are collecting this as part of submitting a bug or issue, ");
    }
    var CharacterFunctions_1;
})(VirtualBard || (VirtualBard = {}));
/// <reference path="../typings/globals/underscore/index.d.ts" />
var Assert;
(function (Assert) {
    var AssertionFailure = (function (_super) {
        __extends(AssertionFailure, _super);
        function AssertionFailure(r) {
            var _this = _super.call(this, r) || this;
            _this.reason = r;
            return _this;
        }
        return AssertionFailure;
    }(Error));
    var passes = 0;
    var failures = 0;
    var scopes = [];
    var ScopeEntry = (function () {
        function ScopeEntry(typeToUse, nameToUse) {
            this.type = typeToUse;
            this.name = nameToUse;
        }
        return ScopeEntry;
    }());
    var ScopeType;
    (function (ScopeType) {
        ScopeType[ScopeType["TestClass"] = 0] = "TestClass";
        ScopeType[ScopeType["TestClassFunction"] = 1] = "TestClassFunction";
        ScopeType[ScopeType["AssertionDescription"] = 2] = "AssertionDescription";
    })(ScopeType || (ScopeType = {}));
    function PrintFailure(result) {
        failures++;
        console.log("FAIL: " + GetScopedPath() + " REASON: " + result);
    }
    function ThrowFail(result) {
        failures++;
        var path = GetScopedPath();
        throw new AssertionFailure("FAIL: " + GetScopedPath() + " REASON: " + result);
    }
    function PrintAssertionPass(assertName) {
        PushAssertionNameScope(assertName);
        PrintPass();
        scopes.pop();
    }
    function PrintAssertionFailure(assertName, reason) {
        PushAssertionNameScope(assertName);
        PrintFailure(reason);
        scopes.pop();
    }
    function PrintPass() {
        passes++;
        console.log("PASS: " + GetScopedPath());
    }
    function PushAssertionNameScope(assertionName) {
        scopes.push(new ScopeEntry(ScopeType.AssertionDescription, assertionName));
    }
    function GetScopedPath() {
        var path = "";
        for (var i = 0; i < scopes.length; i++) {
            var curr = scopes[i];
            var next = i + 1 < scopes.length ? scopes[i + 1] : null;
            if (next == null) {
                path += curr.name;
            }
            else {
                if (next.type == ScopeType.AssertionDescription) {
                    path += curr.name + "=>";
                }
                else {
                    path += curr.name + ".";
                }
            }
        }
        return path;
    }
    function Suite(suiteName, delegate) {
        console.log("=== Starting test suite " + GetScopedPath());
        try {
            delegate();
            console.log("=== Test suite " + GetScopedPath() + " Passed");
        }
        catch (error) {
            if (typeof error !== 'AssertionFailure') {
                var err = error;
                throw "!!! Suite '" + GetScopedPath() + "' Failed.\r\n"
                    + "Reason: " + err.message + "\r\n"
                    + "StackTrace: " + err.stack;
            }
        }
    }
    Assert.Suite = Suite;
    function AreEqual(descript, expected, actual) {
        PushAssertionNameScope(descript);
        try {
            if (expected === actual) {
                PrintPass();
            }
            else {
                ThrowFail("Expected " + expected + ", Actual " + actual);
            }
        }
        finally {
            scopes.pop();
        }
    }
    Assert.AreEqual = AreEqual;
    function TestClass(classToTest) {
        scopes.push(new ScopeEntry(ScopeType.TestClass, classToTest.constructor.name));
        var hasErrors = false;
        for (var p in classToTest) {
            var i = classToTest[p];
            if (typeof i === "function") {
                scopes.push(new ScopeEntry(ScopeType.TestClassFunction, p));
                var method = i;
                try {
                    Suite(p, method);
                    scopes.pop();
                }
                catch (e) {
                    if (e.constructor.name !== 'AssertionFailure') {
                        hasErrors = true;
                        PrintAssertionFailure(p, JSON.stringify(e));
                    }
                    scopes.pop();
                }
            }
        }
        scopes.pop();
        if (hasErrors) {
            throw "Test failed. See previous messages";
        }
    }
    Assert.TestClass = TestClass;
})(Assert || (Assert = {}));
/// <reference path="..\src\VirtualBard.ts" />"
/// <reference path="..\test\TestFramework.ts" />"
var VirtualBard;
(function (VirtualBard) {
    /**
     * Provides a Mock for the Roll20 log function
     */
    var Handler = (function () {
        function Handler() {
        }
        return Handler;
    }());
    var registeredHandlers = [];
    // MOCK MEMBERS
    function log(text) {
        console.log(text);
    }
    VirtualBard.log = log;
    VirtualBard.state = { VirtualBardState: null };
    /**
     * Provides a mock for the roll20 "on"" function
     */
    function on(eventType, func) {
        registeredHandlers.push({
            event: eventType,
            callback: func
        });
    }
    VirtualBard.on = on;
    function findObjs(attrib) {
        return attrib;
    }
    VirtualBard.findObjs = findObjs;
    function createObj(typeName, initParam) {
        initParam.type = typeName;
        initParam.SecretProps = {};
        initParam.get = function (propToGet, callback) {
            var val;
            if (VirtualBard.isAssigned(initParam.SecretProps[propToGet])) {
                val = null;
            }
            else {
                val = initParam.SecretProps[propToGet];
            }
            setTimeout(function () {
                callback(val);
            }, 0);
        };
        initParam.set = function (propToSet, value) {
            initParam.SecretProps[propToSet] = value;
        };
        return initParam;
    }
    VirtualBard.createObj = createObj;
    // END MOCKS
    function RaiseEvent(eventType) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < registeredHandlers.length; i++) {
            var h = registeredHandlers[i];
            if (h.event == eventType) {
                var f = h.callback;
                if (VirtualBard.isAssigned(rest) && rest.length > 0) {
                    f();
                }
                else {
                    f.apply(this, rest);
                }
            }
        }
    }
    VirtualBard.Initialize();
    RaiseEvent("ready");
    var myString = "balls balls and balls and stuff<test id=\"1\" others=\"5\">someother <innerTest></innerTest></test>";
    var r = VirtualBard.findTag(myString, "test", { id: "1" });
    Assert.AreEqual("HTMLEdit Basic test", "balls balls and balls and stuff<test id=\"1\" others=\"5\">[Prepended]someother <innerTest>[SetText]</innerTest>[Appended]</test>", r.appendText("[Appended]").prependText("[Prepended]").findTag("innerTest").setText("[SetText]").getText());
    var FunctionTests = (function () {
        function FunctionTests() {
        }
        FunctionTests.prototype.TestDuration = function () {
            var d = new VirtualBard.Duration();
            Assert.AreEqual("Zero time", "Beginning", d.GetDisplayText());
            d.Hour = 1;
            Assert.AreEqual("One hour (no plural)", "1 hour", d.GetDisplayText());
            d.Hour = 2;
            Assert.AreEqual("Two hours (plural)", "2 hours", d.GetDisplayText());
            d.Day = 1;
            Assert.AreEqual("Two hours + 1 day", "2 hours and 1 day", d.GetDisplayText());
            d.Week = 1;
            Assert.AreEqual("3 parts", "2 hours, 1 day and 1 week", d.GetDisplayText());
            d.Month = 1;
            Assert.AreEqual("4 parts", "2 hours, 1 day, 1 week and 1 month", d.GetDisplayText());
            d.Year = 1;
            Assert.AreEqual("5 parts", "2 hours, 1 day, 1 week, 1 month and 1 year", d.GetDisplayText());
        };
        FunctionTests.prototype.TestCalendar = function () {
            var c = new VirtualBard.AdventureCalendar();
            Assert.AreEqual("DisplayText", "Midnight 1st of Hammer 0PR", c.GetDisplayText());
            c.AddHours(1);
            Assert.AreEqual("DisplayText + 1hr", "Moondark 1st of Hammer 0PR", c.GetDisplayText());
            c.AddHours(24);
            Assert.AreEqual("DisplayText + 24hr", "Moondark 2nd of Hammer 0PR", c.GetDisplayText());
            c.SetTime(0);
            Assert.AreEqual("SetTime to 0", "Midnight 2nd of Hammer 0PR", c.GetDisplayText());
            c.StartNextDay();
            Assert.AreEqual("StartNextDay with default", "Dawn 3rd of Hammer 0PR", c.GetDisplayText());
            c.StartNextDay("Sunset");
            Assert.AreEqual("Sunset with default", "Sunset 4th of Hammer 0PR", c.GetDisplayText());
            Assert.AreEqual("Sunset Hour", 18, c.CurrentDuration.Hour);
            c.ProgressDayPortion();
            Assert.AreEqual("ProgressDayPortion", "Evening 4th of Hammer 0PR", c.GetDisplayText());
            c.AddHours(-24);
            Assert.AreEqual("Display Text - 24hr", "Evening 3rd of Hammer 0PR", c.GetDisplayText());
            VirtualBard.settings.CalendarConfiguration.Start.Year = 1000;
            Assert.AreEqual("Display Text + 1000 year base", "Evening 3rd of Hammer 1000PR", c.GetDisplayText());
            VirtualBard.settings.CalendarConfiguration.Start.Month = 6;
            Assert.AreEqual("Display Text + 6 month base", "Evening 3rd of Flamerule 1000PR", c.GetDisplayText());
            VirtualBard.settings.CalendarConfiguration.Start.Week = 2;
            Assert.AreEqual("Display Text + 2 week base", "Evening 23rd of Flamerule 1000PR", c.GetDisplayText());
            VirtualBard.settings.CalendarConfiguration.Start.Week = 3;
            Assert.AreEqual("Display Text + 3 week base", "Evening 3rd of Elesias 1000PR", c.GetDisplayText());
        };
        FunctionTests.prototype.TestLocations = function () {
            VirtualBard.LoadState();
            VirtualBard.CurrentState.Calendar.AddHours(10);
            VirtualBard.CurrentState.Location.NewLocation("Baldurs Gate");
            Assert.AreEqual("Root Location", "Baldurs Gate", VirtualBard.CurrentState.Location.GetLocationPath());
            VirtualBard.CurrentState.Calendar.AddHours(10);
            Assert.AreEqual("Location timespan", "10 hours", VirtualBard.CurrentState.Location.CurrentLocation.GetDuration().GetDisplayText());
            Assert.AreEqual("Total duration = 20", 20, VirtualBard.CurrentState.Calendar.CurrentDuration.Hour);
            VirtualBard.CurrentState.Location.EnterSubLocation("Sewers");
            Assert.AreEqual("New sub location", "Sewers<=Baldurs Gate", VirtualBard.CurrentState.Location.GetLocationPath());
            VirtualBard.CurrentState.Calendar.AddHours(10);
            var left = VirtualBard.CurrentState.Location.LeaveSubLocation();
            Assert.AreEqual("Left location", "Sewers", left.Name);
            Assert.AreEqual("10 hours at sub location", 10, left.GetDuration().Hour);
            Assert.AreEqual("Path back to root", "Baldurs Gate", VirtualBard.CurrentState.Location.GetLocationPath());
            Assert.AreEqual("Total time at root is 20 hours", "20 hours", VirtualBard.CurrentState.Location.CurrentLocation.GetDuration().GetDisplayText());
        };
        return FunctionTests;
    }());
    Assert.TestClass(new FunctionTests());
})(VirtualBard || (VirtualBard = {}));
