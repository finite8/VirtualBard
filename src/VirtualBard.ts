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




namespace VirtualBard {
    export let revision : string = "$Id$";
    let debugMode = true;
    export function Debug(text: any) : void
    {
        if (debugMode == true)
        {
            let stack = (new Error()).stack;
            log(`${JSON.stringify(text)} -- ${stack.split("\n")[2].trim()}`);
        }
    }

// === DECORATORS ===
    class EventClass
    {
        AdventureStateChanged : {(...params : any[]) : void}[] = [];
        EventLogged : {(eventData: string) : void}[] = [];
        public RaiseAdventureStateChanged() : void {
            this.RaiseEvent(this.AdventureStateChanged);
        }
        public LogEvent(eventData: string) : void {
            this.RaiseEvent(this.EventLogged, eventData);
        }
        private RaiseEvent(eventArray : {(...params : any[]) : void}[], ...args : any[]) : void
        {
            eventArray.forEach(element => {
                element.apply(args);
            });
        }

    }
    export let Events = new EventClass();
    
    class VBModuleInfo
    {
        Prefix: string;
        Name: string;
        Description: string = "No additional info available";
        Commands : VBModuleCommandInfo[] = [];
        PostDelegates: {(ctx: UserContext) : void}[] = [];
        public GetCommandInfo(cmdText: string) : VBModuleCommandInfo
        {
            for (let i = 0; i < this.Commands.length; i++)
            {
                let cmd = this.Commands[i];
                if (`-${cmd.Prefix}` == cmdText)
                {
                    return cmd;
                }
            }
            throw `No command found with prefix "${cmdText}`;
        }
    }

    class VBModuleCommandInfo
    {
        Prefix: string;
        Description: string = "No additional info available";
        Delegate: (ctx: UserContext, cmd: MessageCommand) => void;
    }

    export let LoadedModules : VBModuleInfo[] = [];

    

    function GetVBModuleForClass(className: string) : VBModuleInfo
    {
        for (let i = 0; i < LoadedModules.length; i++)
        {
            let m = LoadedModules[i];
            if (m.Name == className)
            {
                return m;
            }
        }
        let newM = new VBModuleInfo();
        newM.Name = className;
        
        LoadedModules.push(newM);
        return newM;
    }
    function VBModule(modulePrefix: string, description?: string) {
        return function (constructor: Function) {
            //console.log(modulePrefix);
            //console.log(constructor);
            
            let m = GetVBModuleForClass((<any> constructor).name); // cast to any to shut typescript up
            m.Prefix = modulePrefix;
            if (isAssigned(description))
            {
                m.Description = description;
            }
            //console.log(JSON.stringify(LoadedModules));
        }
    }
    function VBModulePostAction() {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            let m = GetVBModuleForClass(target.constructor.name);
            let postDel : (ctx: UserContext) => void = descriptor.value;
            m.PostDelegates.push(postDel);
        };
    }

    function VBModuleCommand(commandText: string, description?: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            //console.log(commandText);
            //console.log(target);
            //console.log(descriptor);
            let m = GetVBModuleForClass(target.constructor.name);
            let cmd = new VBModuleCommandInfo();
            cmd.Prefix = commandText;
            cmd.Delegate = descriptor.value;
            if (isAssigned(description))
            {
                cmd.Description = description;
            }
            m.Commands.push(cmd);
            //console.log(JSON.stringify(LoadedModules));
        };
    }
//  
    function Setup(completionCallback: () => void): void {
        
        on("ready", function () {
            Debug("Ready Fired");
            let settingsHandout = p_sysFunctions.getHandout("VBSettings", true, false);
            settingsHandout.get("gmnotes", function (d) {
                try {
                    
                    var tag = findTag(d, "Settings");
                    let setData: boolean = true;
                    var loadedSettings;
                    if (tag != null) {
                        loadedSettings = JSON.parse(tag.text);
                        if ((JSON.stringify(loadedSettings) != JSON.stringify({}))
                            && (loadedSettings != null)) {
                            setData = false;
                        }
                    }
                    
                    if (setData) { // we need to populate it with conifg data as it was blank.
                        settings = DefaultSettings();
                        setTimeout(function () {

                            var notes = JSON.stringify(settings);
                            
                            settingsHandout.set("gmnotes", "<Settings>" + notes + "</Settings>");
                            LoadState();
                            
                            if (isAssigned(completionCallback)) {
                                
                                completionCallback();
                            }
                        }, 100);
                    }
                    else {
                        //log("Existing: " + JSON.stringify(loadedSettings));
                        settings = _.extend(DefaultSettings(), loadedSettings);
                        LoadState();
                        //log(completionCallback);
                        if (isAssigned(completionCallback)) {
                            //log("Raising callback");
                            completionCallback();
                        }
                        
                    }
                    
                }
                catch (err) {
                    // we dont REALLY care about the error. we will however use it to indicate some kind of json error
                    log("WARNING! Configuration error. Failed to parse custom settings data. Error: " + err.message);
                    settings = DefaultSettings();
                }

                

            });
        });

    }
    enum MessageType {
        Test = 0,
        All = 1,
        Character = 2
    };
    enum CharacterMode {
        /** A Character sheet is used to store information about the character. This is the ideal mode of operation */
        Sheet = 0,
        /** A Handout is used to store character information. This will use the GM Notes to store JSON data and a HTML region in the notes to provide detail. */
        Handout = 1,
        /** A Single handout is used to store information for all characters encountered. GM Notes is used to store JSON data and a HTML region in the notes to provide detail. */
        SingleHandout = 2,
    }






    //   var messageTypes = {
    //     test : "test",
    //     character   : "Character Event"
    //   };
    var VBAttributes = {
        IsMet: "VB-IsMet"
    }


    function testCode() {

    }
    class DayTimeRange {
        public Name: string;
        public StartHour: number;
        public EndHour: number;
    }
    export class Duration {
        public constructor(basis? : Duration) {
            this.Year = basis && basis.Year || 0;
            this.Month = basis && basis.Month || 0;
            this.Week = basis && basis.Week || 0;
            this.Day = basis && basis.Day || 0;
            this.Hour = basis && basis.Hour || 0;
        }
        
        public Year: number;
        public Month: number;
        public Week: number;
        public Day: number;
        public Hour: number;
        public static nth(d: number): string {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        }
        /** Returns the equivlanet DatTimeRange for a given hour of the day */
        public static GetDayTimePortion(hour: number): DayTimeRange {
            let useStartHour = hour == 24 ? 0 : hour;
            
            
            for (var i = 0; i < settings.DayTimeRanges.length; i++) {
                let r = settings.DayTimeRanges[i];
                if ((useStartHour >= r.StartHour) && (hour < r.EndHour || r.StartHour == r.EndHour)) {
                    return r;
                }
            }
            throw "No DayTimeRange was specified in settings for hour " + hour;
        }
        
        public AddDuration(other: Duration): void {
            this.Day += other.Day;
            this.Hour += other.Hour;
            this.Week += other.Week;
            this.Month += other.Month;
            this.Year += other.Year;
            this.BalanceTime();
        }
        /**
         * Subtracts one duration from another. Note: will not work well with negative results
         * @param {Duration} from: The Duration to have time taken away from
         * @param {Duration} take: The amount of time to take 
         * i.e.: 5 - 1 = from - take = 4
         */
        public static GetDifference(from: Duration, take: Duration) : Duration
        {
            let toReturn = new Duration(from);
            toReturn.Day -= take.Day;
            toReturn.Hour -= take.Hour;
            toReturn.Week -= take.Week;
            toReturn.Month -= take.Month;
            toReturn.Year -= take.Year;
            toReturn.BalanceTime();
            return toReturn;
        }

        public GetDisplayText() : string {
            
            let parts : string[] = [];
            if (this.Hour > 0)
            {
                let part = `${this.Hour} hour`;
                
                if (this.Hour > 1)
                {
                    part += "s"
                }
                parts.push(part);
            }
            if (this.Day > 0)
            {
                let part = `${this.Day} day`;
                if (this.Day > 1)
                {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Week > 0)
            {
                let part = `${this.Week} week`;
                if (this.Week > 1)
                {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Month > 0)
            {
                let part = `${this.Month} month`;
                if (this.Month > 1)
                {
                    part += "s";
                }
                parts.push(part);
            }
            if (this.Year > 0)
            {
                let part = `${this.Year} year`;
                if (this.Year > 1)
                {
                    part += "s";
                }
                parts.push(part);
            }
            if (parts.length == 0)
            {
                return "Beginning";
            }
            else
            {
                let retString = "";
                // we need to add commas inbetween all the parts, except for the last one. that gets an "and"
                for(var i = 0; i < parts.length; i++)
                {
                    retString += parts[i];
                    if (i < parts.length - 2)
                    {
                        retString += ", ";
                    }
                    else if (i == parts.length - 2)
                    {
                        retString += " and ";
                    }
                }
                return retString;

            }

        }

        
        
        public BalanceTime(): void {
            // Hours
            while (this.Hour >= settings.CalendarConfiguration.HoursInDay) {
                this.Hour -= settings.CalendarConfiguration.HoursInDay;
                this.Day += 1;
            }
            while (this.Hour < 0) {
                this.Hour += settings.CalendarConfiguration.HoursInDay;
                this.Day -= 1;
            }
            // Days
            while (this.Day >= settings.CalendarConfiguration.DaysInWeek) {
                this.Day -= settings.CalendarConfiguration.DaysInWeek;
                this.Week += 1;
            }
            while (this.Day < 0) {
                this.Day += settings.CalendarConfiguration.DaysInWeek;
                this.Week -= 1;
            }
            // Weeks
            while (this.Week >= settings.CalendarConfiguration.WeeksInMonth) {
                this.Week -= settings.CalendarConfiguration.WeeksInMonth;
                this.Month += 1;
            }
            while (this.Week < 0) {
                this.Week += settings.CalendarConfiguration.WeeksInMonth;
                this.Month -= 1;
            }
            // Months
            while (this.Month >= settings.CalendarConfiguration.MonthsInYear) {
                this.Month -= settings.CalendarConfiguration.MonthsInYear;
                this.Year += 1;
            }
            while (this.Month < 0) {
                this.Month += settings.CalendarConfiguration.MonthsInYear;
                this.Year -= 1;
            }

        }
    }
    enum LogDirections
    {
        Up,
        Down
    }
    class AdventureLogConfig {
        HandoutName: string = "Adventure Log";
        LogDirection: LogDirections = LogDirections.Down;
    }
    class VirtualBardStateOutputConfig {
        HandoutName: string = "Virtual Bard State";
        LogDirection: LogDirections = LogDirections.Up;
        Enabled: boolean = true;
    }
    class CalendarConfig {
        HoursInDay: number;
        DaysInWeek: number;
        WeeksInMonth: number;
        MonthsInYear: number;
        /** The suffix at the end of the year. i.e: 145PR */
        YearSuffix: string;
        /** The start date of the adventure. i.e: When the the adventure begin? */
        Start: Duration;
        /** 0 based index of month names. */
        MonthNames: string[];
    }
    /** A calendar that provides specific logic. This is designed to work with the D&D calendar, but could be expanded for other calendar systems  */
    export class AdventureCalendar {
        private LogChange() : void
        {
            Events.LogEvent(`Time changed: ${this.GetDisplayText()}`);
            Events.RaiseAdventureStateChanged();
        }
        public CurrentDuration: Duration = new Duration();
        public AddHours(hours: number): void {
            this.CurrentDuration.Hour += hours;
            this.CurrentDuration.BalanceTime();
            this.LogChange();
        }

        public GetDisplayText(): string {
            let useDuration = new Duration(settings.CalendarConfiguration.Start);
            useDuration.AddDuration(this.CurrentDuration);
            let port = Duration.GetDayTimePortion(useDuration.Hour);
            let diff = useDuration.Hour - port.StartHour;
            let hourPortionText = diff == 0 ? "" : diff + " hours after ";
            let dayPart = (useDuration.Day + 1) + (useDuration.Week * settings.CalendarConfiguration.DaysInWeek)
            return "" + hourPortionText + port.Name
                + " " + (dayPart) + Duration.nth(dayPart)
                + " of " + settings.CalendarConfiguration.MonthNames[useDuration.Month]
                + " " + useDuration.Year + settings.CalendarConfiguration.YearSuffix;
        }



        /** Progresses the day to the next time period (i.e: Dawn -> Morning). This will progress through to the next day */
        public ProgressDayPortion(): void {
            let currentPortion = Duration.GetDayTimePortion(this.CurrentDuration.Hour);
            this.AddHours(currentPortion.EndHour - this.CurrentDuration.Hour);
            this.LogChange();
        }
        /** Sets the current hour in the day to a different time. Will not progress to the next day*/
        public SetTime(hour: number): void {
            this.CurrentDuration.Hour = hour;
            this.CurrentDuration.BalanceTime();
            this.LogChange();
        }
        /** Moves to the next day. If portion is not provided, hour will be set to 6 (default: dawn)*/
        public StartNextDay(portion?: string): void {
            this.CurrentDuration.Day += 1;
            if (isAssigned(portion)) {
                for (var i = 0; i < settings.DayTimeRanges.length; i++) {
                    let r = settings.DayTimeRanges[i];
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
            this.LogChange();
        }


    }
    class CharacterFindResult {
        public IsNew: boolean;
        public Char: CharacterReferenceBase;
    }
    class UserContext {
        constructor(playerId: string, userName: string) {
            this.PlayerId = playerId;
            this.UserName = userName;
        }
        public PlayerId: string;
        public UserName: string;
        public Current: any;
        public CurrentChar: CharacterReferenceBase;

        public SendChat(text: string): void {
            sendMessage(this.UserName, text);
        }
    }
    /**
     * The location info provides an individual entry for location history.
     */
    class LocationInfo
    {
        /** The duration that the location entry was started at. It can use this and difference it with current duration to get total time at the location. */
        ArrivalDuration : Duration; 
        /** Name of the location */
        Name: string;
        /** The parent location. i.e: If in "The Sewers", "Baldurs Gate" might be the parent */
        ParentLocation: LocationInfo;
        /** Gets the total duration at this location (current time minus time of arrival) */
        public GetDuration() : Duration
        {
            return Duration.GetDifference(CurrentState.Calendar.CurrentDuration,this.ArrivalDuration);
        }
    }

    class LocationManager
    {
        constructor ()
        {
            this.CurrentLocation = new LocationInfo();
            this.CurrentLocation.Name = "An unknown location";
            this.CurrentLocation.ArrivalDuration = new Duration();
        }

        private LogMove() : void
        {
            // add function to write nicely to the adventure log
            Events.LogEvent(`Location Changed: ${this.GetLocationPath()}`);
            Events.RaiseAdventureStateChanged();
        }
        
        public CurrentLocation: LocationInfo;
        /** Returns a simple path of the current location. Useful for informative purposes */
        public GetLocationPath() : string
        {
            let loc = this.CurrentLocation;
            if (!isAssigned(loc))
            {
                return "Location not specified";
            }
            else
            {
                let retStr = loc.Name;
                while (loc != null)
                {
                    loc = loc.ParentLocation;
                    if (loc != null)
                    {
                        retStr += `<=${loc.Name}`;
                    }
                }
                return retStr;
            }
        }
        public NewLocation(locationName: string) : void
        {
            this.CurrentLocation = new LocationInfo();
            this.CurrentLocation.ArrivalDuration = new Duration(CurrentState.Calendar.CurrentDuration);
            this.CurrentLocation.Name = locationName;
            this.LogMove();
            
        }
        public EnterSubLocation(locationName: string) : void
        {
            if (!isAssigned(this.CurrentLocation))
            {
                throw "Cannot enter a sub location without specifing an overall location first";
            }
            else
            {
                let newLoc = new LocationInfo();
                newLoc.ArrivalDuration = new Duration(CurrentState.Calendar.CurrentDuration);
                newLoc.Name = locationName;
                newLoc.ParentLocation = this.CurrentLocation;
                this.CurrentLocation = newLoc;
                this.LogMove();
            }
        }
        /** 
         * Leaves a sub location if possible, throws otherwise.
         * @returns {LocationInfo} The name of the sub location that was left.
         */
        public LeaveSubLocation() : LocationInfo
        {
            if (!isAssigned(this.CurrentLocation) || (this.CurrentLocation.ParentLocation == null))
            {
                throw "Cannot leave a sub location without being in one first";
            }
            let oldLoc = this.CurrentLocation;
            this.CurrentLocation = this.CurrentLocation.ParentLocation;
            this.LogMove();
            return oldLoc;

        }
    }
    
    /** The adventure state is designed to manage the current progress of the adventure. This can be interacted by specific Commands
     * and other elements of VirtualBard will use this to log more specific information
     */
    class AdventureState {
        public constructor() {
            this.Calendar = new AdventureCalendar();
            this.Location = new LocationManager();
        }
        public Calendar: AdventureCalendar;
        public Location: LocationManager;
    }

    export let CurrentState : AdventureState;
    export function LoadState() : void
    {
        CurrentState = new AdventureState();
        if (isAssigned(state.VirtualBardState))
        {
            _.extend(CurrentState, state.VirtualBardState);
        }
    }

    export function SaveState() : void
    {
        state.VirtualBardState = CurrentState;
    }


    /**
     * This is a core Character data container. This stores all of the core character data properties. It is up the the individual
     * reference implementation to store the data in its respecive container.
     * This contains the core properties of character data, but more can be added at any time. In no way
     * should data storage be limited to the properties defined here.
     */
    class CharacterData {
        public Name: string;
        public Race: string;
        public Class: string;
        public Sex: string;
        public SetProperty(propName: string, value: any): void {
            // we will do a case insensitive search first
            for (var i in this) {
                if (this.hasOwnProperty(i) && (i.toLowerCase() == propName.toLowerCase())) {
                    this[i] = value;
                    return;
                }
            }
            this[propName] = value;
        }
        public GetProperty<T>(propName: string): T {
            // we will do a case insensitive search first
            for (var i in this) {
                if (this.hasOwnProperty(i) && (i.toLowerCase() == propName.toLowerCase())) {
                    return (this[i] as any) as T;
                }
            }
            var result = this[propName];
            if (isAssigned(result)) {
                return (result) as T;
            }
            else {
                return null as T;
            }
        }
    }
    /**
     * As character containers can take several forms (Character sheets, Handout sheets, or nothing), this is used
     * to abstract that behaviour accordingly.
     */
    abstract class CharacterReferenceBase {
        constructor() {

            this.Data = new CharacterData();
        }
        /** implementers need to make sure that they initialize this. */
        protected Data: CharacterData;

        protected abstract SaveData(data: CharacterData): void;
        /** internal method for committing a value. Ensure that the value that was really saved is what is returned. */
        protected abstract AssignAttributeValue(attribName: string, attribValue: any): any;

        /** By default, this will retrieve values from the CharacterData object. This can be overidden by other implementations to do more fancy things */
        public GetAttribute<T>(attribName: string): T {
            return this.Data.GetProperty<T>(attribName);
        }
        public SetAttribute(attribName: string, attribValue: any): void {
            var savedValue = this.AssignAttributeValue(attribName, attribValue);
            this.Data.SetProperty(attribName, savedValue);
            this.SaveData(this.Data);
        }


    }
    /**
     * A character that has their own character sheet to store their information.
     */
    class CharacterSheetReference extends CharacterReferenceBase {
        constructor(char: Roll20Object) {
            super();
            this.CharSheet = char;
            this.LoadData();
        }
        CharSheet: Roll20Object;
        protected LoadData(): void {
            let refObj = this;
            refObj.Data.SetProperty("Name", this.CharSheet.get("name"));
            this.CharSheet.get("gmnotes", function (t: string) {
                let tag = findTag(t, "CharData");
                if (tag != null) {
                    var jData = JSON.parse(tag.text);
                    _.extend(refObj.Data, jData);
                    // We need to enumerate all of the properties defined in the character
                    for (let pName in refObj.Data) {
                        if (refObj.Data.hasOwnProperty(pName)) {
                            refObj.Data[pName] = p_sysFunctions.getCharacterAttribute(refObj.CharSheet, pName);
                        }
                    }

                }
                refObj.Data.SetProperty("Name", refObj.CharSheet.get("name"));
            });
        }
        protected SaveData(data: CharacterData): void {
            let refObj = this;
            log("Saving");
            log(this);
            this.CharSheet.get("gmnotes", function (t: string) {
                let htmlEdt = findTag(t, "CharData").setText(JSON.stringify(refObj.Data));
                setTimeout(function () {
                    refObj.CharSheet.set("gmnotes", htmlEdt.getText());
                }, 100);
            });
        }
        protected AssignAttributeValue(attribName: string, attribValue: any): any {
            p_sysFunctions.setCharacterAttribute(this.CharSheet, attribName, attribValue);
            return attribValue;
        }
    }
    // class CharacterHandoutReference extends CharacterReferenceBase
    // {
    //     constructor()
    // }

    class TextPointer {
        value: string;
    }
    class HTMLTextEditor {
        originalText: TextPointer;
        tagAttributes: string;
        tag: string;
        endTag: string;
        text: string;
        startIndex: number;
        innerStartIndex: number;
        innerEndIndex: number;
        endIndex: number;
        getText() { return this.originalText.value; }
        findTag(subTag: string, subAttributes?: any): HTMLTextEditor {
            return findTag(this.text, subTag, subAttributes, this);
        }
        appendText(textToAppend: string): HTMLTextEditor {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerEndIndex) + textToAppend + txtToModify.slice(this.innerEndIndex)
            this.innerEndIndex += textToAppend.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        }
        setText(textToSet: string): HTMLTextEditor {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToSet + txtToModify.slice(this.innerEndIndex)
            this.innerEndIndex = this.innerStartIndex + textToSet.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        }
        prependText(textToPrepend: string): HTMLTextEditor {
            var txtToModify = this.originalText.value;
            this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToPrepend + txtToModify.slice(this.innerStartIndex)
            this.innerEndIndex += textToPrepend.length;
            this.endIndex = this.innerEndIndex + this.endTag.length;
            this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            return this;
        }
        appendTag(tagToAppend: string): HTMLTextEditor {
            let edt = this.appendText("<" + tagToAppend + "></" + tagToAppend + ">");
            return edt.findTag(tagToAppend);
        }
        /** Removes the HTML tags. */
        removeTag() : HTMLTextEditor {
            var txtToModify = this.originalText.value;
            let content = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
            this.originalText.value = txtToModify.slice(0, this.startIndex) + content + txtToModify.slice(this.endIndex);
            this.tag = null;
            this.innerEndIndex = null;
            this.endIndex = null;
            this.text = content;
            return this;
        }
    }
    /** Newline constant */
    export let c_NL = "<br>";
    /** Tab spacing */
    export let c_TAB = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
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
            VirtualBardMessageSourceName : "Virtual Bard",
            CharacterResolutionOrder: //{mode : CharacterMode, canCreate : boolean}[] = 
            [{ mode: CharacterMode.Sheet, canCreate: false } // attempt to find a sheet first
                , { mode: CharacterMode.Handout, canCreate: false } // then try to find a handout
                , { mode: CharacterMode.SingleHandout, canCreate: false } // then try to find a single handout
                , { mode: CharacterMode.Sheet, canCreate: true } // otherwise, fall back and create the character sheet
            ],
            AdventureLogConfiguration: new AdventureLogConfig(),
            VirtualBardStateOutputConfiguration: new VirtualBardStateOutputConfig()
            , CalendarConfiguration: <CalendarConfig>
            {
                HoursInDay: 24
                , DaysInWeek: 10
                , WeeksInMonth: 3
                , MonthsInYear: 12
                , Start: new Duration()
                , YearSuffix: "PR"
                , MonthNames: ["Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn", "Flamerule", "Elesias", "Eleint", "Marpenoth", "Uktar", "Nightal"]
            }
            ,/** When specifying this, make sure that it is sequential else the time portion incrementer will not work */DayTimeRanges: <DayTimeRange[]>[
                { Name: "Dawn", StartHour: 6, EndHour: 7 }
                , { Name: "Morning", StartHour: 7, EndHour: 12 }
                , { Name: "Highsun", StartHour: 12, EndHour: 13 }
                , { Name: "Afternoon", StartHour: 13, EndHour: 17 }
                , { Name: "Dusk", StartHour: 17, EndHour: 18 }
                , { Name: "Sunset", StartHour: 18, EndHour: 19 }
                , { Name: "Evening", StartHour: 19, EndHour: 24 }
                , { Name: "Midnight", StartHour: 0, EndHour: 1 }
                , { Name: "Moondark", StartHour: 1, EndHour: 6 }
            ]
        }
    };
    export function matchRuleShort(str : string, rule : string) : boolean {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
    }

    export let settings = DefaultSettings();
    /**
     *  returns a object that describes the results. The returned object supports additional searcing and text modification functions.
     */
    export function findTag(baseText: string, tag: string, attributes?: any, basis?: HTMLTextEditor): HTMLTextEditor {

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
                        //log("missing attribute");
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

    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }
    export function isAssigned(obj) {
        return obj != null && typeof obj !== 'undefined';
    }
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
    function isAnyDefined(...toTest: string[]): boolean {
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
            var key = keys[i],
                subkeys = key.split(/,\s?/),
                target = obj[key];
            delete obj[key];
            subkeys.forEach(function (key) { obj[key] = target; })
        }
        return obj;
    }
    class MessageInfo {
        IsValid: boolean;
       
        Module: VBModuleInfo;
        UserContextId: string;
        UserName: string;
        Commands: MessageCommand[];

    }
    class MessageCommand {
        Type: string;
        Params: string[] = [];
    }

    function parseMessage(msg): MessageInfo {
        var result = new MessageInfo();
        if (msg.type != "api") {
            result.IsValid = false;
            return result;
        }
        
        let found = false;
        for (let i = 0; i < LoadedModules.length; i++)
        {
            let m = LoadedModules[i];
            
            if (msg.content.indexOf(`!${m.Prefix}`) == 0)
            {
                result.Module = m;
                found = true;
                break;
            }
        }
        if (!found)
        {
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
                    addedSomething = true;
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


        Debug(result);
        return result;
    }

    function processAction(user, data) {


    }

    function sendMessage(user, message) {
        sendChat(settings.VirtualBardMessageSourceName, "/w " + user + " " + message);
    }

    function broadcastMessage(message) {
        sendChat(settings.VirtualBardMessageSourceName, message);
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
    function process(context: UserContext, data: MessageInfo) {
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
                    
                    let cmdInfo = data.Module.GetCommandInfo(cmd.Type);
                    cmdInfo.Delegate(context, cmd);
                }
                catch (er) {
                    log(JSON.stringify(er));
                    if (typeof er == "Error")
                    {
                        let err: Error = er;
                        
                        errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + err.message + ", stack=" + err.stack);
                    }
                    else
                    {
                        errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + er);
                    }
                }
            }
            for (let i = 0; i < data.Module.PostDelegates.length; i++)
            {
                data.Module.PostDelegates[i](context);
            }
            // if (isDefined(postAction)) {
            //     postAction(context);
            // }
            if (errors.length > 0) {
                throw "Following errors were encountered:" + c_NL + errors.join(c_NL);
            }
            //}
        

    }
    @VBModule("vb", "Virtual bard system functions. For maintenence and configuration functions")
    class SystemFunctions
    {
        @VBModuleCommand("enableDebug")
        public enableDebug(ctx: UserContext, cmd: MessageCommand) : void
        {
            debugMode = true;
            Debug("Debug Mode enabled");
        }

        @VBModuleCommand("disableDebug")
        public disableDebug(ctx: UserContext, cmd: MessageCommand) : void
        {
            debugMode = false;
            log("Debug Mode disabled");
        }

        @VBModuleCommand("help")
        public listModules(ctx: UserContext, cmd: MessageCommand) : void
        {   
            if (cmd.Params.length > 0)
            {
                for (let i = 0; i < LoadedModules.length; i++)
                {
                    let m = LoadedModules[i];
                    
                    if (cmd.Params[0].indexOf(`!${m.Prefix}`) == 0)
                    {
                        SystemFunctions.listCommands(m, ctx);
                        return;
                    }
                }
                ctx.SendChat(`Module "${cmd.Params[0]}" not found`);
            }

            let result = "Available VirtualBard Command Modules:" + c_NL;
            for (let i = 0; i < LoadedModules.length; i++)
            {
                let m = LoadedModules[i];
                result += `$ !${m.Prefix} = ${m.Name} ${c_NL}${c_TAB}   ${m.Description}${c_NL}`;
            }
            result += 'use "!vb -help [!module]" to list that modules commands'
            ctx.SendChat(result);
        }

        public static listCommands(moduleInfo : VBModuleInfo, ctx: UserContext) : void
        {
            let result = "";
            for (let i = 0; i < moduleInfo.Commands.length; i++)
            {
                let c = moduleInfo.Commands[i];
                result += `$ !${moduleInfo.Prefix} -${c.Prefix} ${c_NL}${c_TAB}  ${c.Description} ${c_NL}`;
            }
            ctx.SendChat(result);
        }
    }
    
    @VBModule("c", "NPC and PC related functions. Covers encounters and information logging")
    class CharacterFunctions
    {
        @VBModulePostAction()
        public logAction(ctx : UserContext) : void
        {
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
        }

        @VBModuleCommand("who", "Switches context to the specified character")
        public whoAction(ctx: UserContext, cmd: MessageCommand) : void
        {
            var charName = cmd.Params.join(" ");
            let r = p_sysFunctions.getCharacterInfo(charName);
            if (isDefined(r)) {
                // we have the character

                ctx.CurrentChar = r.Char;
                ctx.SendChat("Character context set to: " + r.Char.GetAttribute<string>("Name"));
            }
            else {
                ctx.SendChat("No character exists with name: " + charName);
            }
        }
        @VBModuleCommand("find", "Searches for a PC or NPC by name using wildcard syntax '*'")
        public findAction(ctx: UserContext, cmd: MessageCommand) : void
        {
            let charNames = p_sysFunctions.listCharacters();
            log(charNames);
            let matchRule = cmd.Params.join(" ").toLowerCase().trim();
            let matches : string[] = [];
            for (var i = 0; i < charNames.length; i++)
            {
                let charName = charNames[i];
                if (matchRuleShort(charName.toLowerCase().trim(), matchRule))
                {
                    matches.push(charName);
                }
            }
            if (matches.length == 0)
            {
                ctx.SendChat("No characters found");
            }
            else
            {
                let textToDisplay : string = `Found ${matches.length} characters ${c_NL}`;
                matches.forEach(element => {
                    textToDisplay += `[${element}](!c -who ${element}) ${c_NL}`;
                });
                ctx.SendChat(textToDisplay);
            }
        }

        @VBModuleCommand("met")
        public metAction (ctx: UserContext, cmd: MessageCommand) : void{
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.getCharacterInfo(charName);
            Debug("Char Info: " + r);
            if (!r.IsNew) {
                sendMessage(ctx.UserName, "The party is already aware of " + charName);
            }
            else {
                //broadcastMessage("The party met " + charName);
                //ctx.Current.SentenceParts.Name = charName;
            }
            ctx.Current.SentenceParts.Name = charName;
            ctx.CurrentChar = r.Char;

        }
        @VBModuleCommand("c")
        public classAction(ctx: UserContext, cmd: MessageCommand) : void {
            CharacterFunctions.assertCurrentCharDefined(ctx, cmd);
            var realClass = settings.classTypes[cmd.Params[0].toLowerCase()];
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
        }
        @VBModuleCommand("s")
        public sexAction (ctx: UserContext, cmd: MessageCommand) : void {
            CharacterFunctions.assertCurrentCharDefined(ctx, cmd);
            var sex = CharacterFunctions.parseSex(cmd.Params[0]);
            ctx.Current.SentenceParts.Sex = sex;
            ctx.CurrentChar.SetAttribute("sex", sex);
        }
        @VBModuleCommand("r")
        public raceAction (ctx: UserContext, cmd: MessageCommand) {
            CharacterFunctions.assertCurrentCharDefined(ctx, cmd);
            ctx.Current.SentenceParts.Race = cmd.Params.join(" ");
            ctx.CurrentChar.SetAttribute("race", ctx.Current.SentenceParts.Race);
        }
        static parseSex (text) {
            var sex = settings.sexTypes[text.toLowerCase()];
            if (typeof sex == 'undefined') {
                throw text + " could not be interpreted as a valid sex";
            }
            return sex;
        }

        static assertCurrentCharDefined (ctx, cmd) : void {
            if (typeof ctx.CurrentChar == 'undefined') {
                throw cmd.Type + " requires a Character context to be set";
            }
        }
    }
    
    

    var p_journalFunctions = {
        journalIsBusy : false,
        wait : function() {
            let timeStarted = new Date();
            while (p_journalFunctions.journalIsBusy == true)
            {
                let timeSpent = (new Date().getTime()) - timeStarted.getTime();
        
                if (timeSpent > 2000)
                {
                    break; // break out after 2 seconds. More than enough time to wait.
                }
            }
        },
        /** Sets the text for the users current journal entry
         * @param ctx {UserContext} - The user context owning this entry
         * @param text {string} - initial text to insert in the new line.
        */
        setEntry : function (ctx : UserContext, text: string) : void {
            // we only ever allow one entry in the journal per user. This keeps it simple. Retro edits are not possible once we have
            // moved beyond this point. This process allows the following:
            // - Edits in progress are still shown in any handouts.
            // - Edits can now happen over several commands. No need to do it all in one line.
            let journal = p_journalFunctions.getJournalHandout();
            log(journal);
            journal.get("notes", function (notes) {
                p_journalFunctions.wait();
                try
                {
                    p_journalFunctions.journalIsBusy = true;
                
                    let r = p_journalFunctions.getJournalTextEditor(notes);
                    let currTag = r.findTag("font", {id: `"${ctx.PlayerId}"`});
                    if (currTag == null)
                    {
                        // if the tag doesn't exist, we need to start a new one.
                        let newTag = `<font id="${ctx.PlayerId}" style="color:red"></font>`;
                        switch (settings.AdventureLogConfiguration.LogDirection)
                        {
                            case LogDirections.Up:
                                r.prependText(newTag);
                                break;
                            case LogDirections.Down:
                                r.appendText(newTag);
                                break;
                        }
                        currTag = r.findTag("font", {id: `"${ctx.PlayerId}"`});
                    }
                    currTag.setText(text);
                    setTimeout(function () { journal.set("notes", r.getText()); }, 5);
                }
                finally
                {
                    p_journalFunctions.journalIsBusy = false;
                }
            });
        },
        /** ends an entry in the journal. If an entry is not available, this does nothing */
        endEntry : function(ctx : UserContext) : void {
             p_journalFunctions.wait();
            try
            {
                p_journalFunctions.journalIsBusy = true;
                let journal = p_journalFunctions.getJournalHandout();
                journal.get("notes", function (notes) {
                    let r = p_journalFunctions.getJournalTextEditor(notes);
                    let currTag = r.findTag("font", {id: `"${ctx.PlayerId}"`});
                    if (currTag != null)
                    {
                        currTag.removeTag();
                        setTimeout(function () { journal.set("notes", r.getText()); }, 5);
                    }
                });
            }
            finally
            {
                p_journalFunctions.journalIsBusy = false;
            }
        },
        getJournalTextEditor : function (notes: string) : HTMLTextEditor
        {
            let r = findTag(notes, "AdventureLog");
            if (r == null)
            {
                // the tag doesn't exist. We need to add it.
                notes += "<AdventureLog></AdventureLog>";
                r = findTag(notes, "AdventureLog");
            }
            return r;
        },
        currentSentence: "",
        appendJournalText: function (text) {
            p_journalFunctions.currentSentence = p_journalFunctions.currentSentence + text;
            var j = p_journalFunctions.getJournalHandout();
            j.get("notes", function (n) {
                Debug("Existing Notes:" + n);
                setTimeout(function () {
                    j.set("notes", n + text);
                }, 100);

            });

            //j.notes = (j.notes || "") + text;
            Debug("Writting to log:" + text);
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


        getJournalHandout: function () : Roll20Object {
            if (typeof this.journalHandout !== 'undefined') {
                return this.journalHandout;
            }
            var handouts = findObjs<Handout>({ _type: "handout", name: settings.AdventureLogConfiguration.HandoutName });
            if (handouts.length == 0) {
                var h = createObj("handout", { name: settings.AdventureLogConfiguration.HandoutName, inplayerjournals: "all", controlledby: "all", notes: "" });
                this.journalHandout = h;
            }
            else {
                Debug("found existing");
                this.journalHandout = handouts[0];
            }
            this.appendJournalLine(new Date(Date.now()).toLocaleString());
            return this.journalHandout;
        }
    };

    var p_sysFunctions = {
        getAsyncHolder : function(id: string) {
            var asyncDict;
            if (!isAssigned(state.VirtualBardState.Async))
            {
                asyncDict = {};
                state.VirtualBardState.Async = asyncDict;
            }
            else
            {
                asyncDict = state.VirtualBardState.Async;
            }
            var asyncHolder = asyncDict[id];
            if (!isAssigned(asyncHolder))
            {
                asyncHolder = {};
                asyncDict[id] = asyncHolder;
            }
            return asyncHolder;
        },
        /** Returns a Roll20 objects value synchronously. If it has not been prepared, this will raise an error.  */
        getAsynchronousValue: function (refObject: Roll20Object, attribName: string) : any
        {
            var holder = p_sysFunctions.getAsyncHolder
        },
        /** Prepares a asynchronous value for synchronous retrieval. Puts the value into the gamestate. */
        prepareAsyncValue : function(refObject: Roll20Object, attribName: string) : void {

        },
        
        getSafeCharacterName: function (charName) {
            return "_vb_c:" + charName;
        },
        /** Gets or Creates a handout with the specified name. */
        getHandout: function (handoutName: string, isHidden: boolean, isEditable: boolean): Roll20Object {
            let hos = findObjs<Handout>({ _type: "handout", name: handoutName });

            Debug(hos);
            if (isAssigned(hos) && hos.length > 0) {
                return hos[0];
            }
            else {
                let inplayerjournalsStr: string;
                if (isHidden) {
                    inplayerjournalsStr = "";
                }
                else {
                    inplayerjournalsStr = "all";
                }
                let isEditableStr: string;
                if (isEditable) {
                    isEditableStr = "all";
                    inplayerjournalsStr = "all";
                }
                else {
                    isEditableStr = "";
                }
                return createObj<Handout>("handout", { name: handoutName, inplayerjournals: inplayerjournalsStr, controlledby: isEditableStr });
            }

        },
        findCharacterSheet: function (charName) {
            var shts = findObjs({ _type: "character", name: charName });
            Debug(shts);
            if (shts.length == 0) {
                return null;
            }
            else {
                return shts[0];
            }
        },
        /** Searches through character listings to find a characters. Uses the Resolution order to find distinct results */
        listCharacters : function () : string[] {
            let result : string[] = [];
            let modeOrder : CharacterMode[] = [];
            for (var i = 0; i < settings.CharacterResolutionOrder.length; i++) {
                let m = settings.CharacterResolutionOrder[i];
                if (modeOrder.indexOf(m.mode) == -1)
                {
                    modeOrder.push(m.mode);
                }
            }
           
            for (var i = 0; i < modeOrder.length; i++)
            {
                let mode : CharacterMode = modeOrder[i];
                switch (mode) {
                    case CharacterMode.Sheet:
                        let cSheets : Roll20Object[] = findObjs<Character>({_type:"character"});
                        for (var i = 0; i < cSheets.length; i++)
                        {
                            let element = cSheets[i];
                            let currName = element.get("name");

                            if (isDefined(currName) && (result.indexOf(currName) == -1))
                            {
                                result.push(currName);
                            }
                        }
                        
                }
            }
            return result;
        },
        /**
         * Resolves the Character info reference. This will return different things based on the mode of operation
         */
        getCharacterInfo: function (charName: string): CharacterFindResult {

            for (var i = 0; i < settings.CharacterResolutionOrder.length; i++) {
                let m = settings.CharacterResolutionOrder[i];
                Debug("Attmepting to resolve character '" + charName + "' using mode '" + CharacterMode[m.mode] + "'")
                switch (m.mode) {
                    case CharacterMode.Sheet:
                        var char = this.findCharacterSheet(charName);
                        let isNew: boolean;
                        if (char == null) {
                            Debug("Could not find Character sheet for " + charName)
                            if (m.canCreate) {
                                Debug("Creating...");
                                char = createObj<Character>("character", { name: charName, inplayerjournals: "all", controlledby: "all" });
                                this.setCharacterAttribute(char, VBAttributes.IsMet, true);
                                isNew = true;
                            }
                            else {
                                Debug("canCreate=false. Continuing...");
                                continue;
                            }
                        }
                        else {
                            Debug("Found!")
                            isNew = !(this.getCharacterAttribute(char, VBAttributes.IsMet) == true);
                        }
                        var ret = new CharacterFindResult();
                        ret.IsNew = isNew;
                        ret.Char = new CharacterSheetReference(char);
                        return ret;

                    default:

                        log("CharacterSheetMode " + JSON.stringify(m) + " is not yet implemented");
                }
            }
            throw "VirtualBard was unable to resolve the character " + charName + ". Try adding more ResolutionOptions or allowing VirtualBard to create sheets or handouts."


        },
        getCharacterAttribute: function (char: Roll20Object, attribName: string): any {
            assertVariableAssigned(char, "char");
            if (!isDefined(char.id)) {
                Debug(char);
                throw "id was undefined on char parameter";
            }
            var result = getAttrByName(char.id, attribName);
            return result;

        },
        setCharacterAttribute: function (char: Roll20Object, attribName: string, newValue: any): void {

            var attribs = findObjs<Attribute>({ _type: "attribute", _characterid: char.id, name: attribName });
            //log(findObjs({_type:"attribute", _characterid:char.id}));
            if (attribs.length == 0) {
                // we instead need to insert it
                var newAttrib = createObj<Attribute>("attribute", { name: attribName, current: newValue, characterid: char.id });
                Debug("Inserting attribute" + attribName);
            }
            else if (attribs.length > 1) {
                throw attribs.length + " attributes discovered with name " + attribName;
            }
            else {
                attribs[0].set("current",newValue);
            }
        }
    };

    var contextStore = {};
    /** Initializes the VirtualBard engine */
    export function Initialize() {
        Setup(function () {
            on<ChatMessage>("chat:message", function (msg: ChatMessage) {
                
                if (msg.who != settings.VirtualBardMessageSourceName)
                {
                    Debug(msg);
                    //try
                    //{
                    if (msg.content.indexOf("!vb DUMP") == 0)
                    {
                        DumpEnvironment();
                    }
                    else
                    {
                        var r = parseMessage(msg);
                        if (r.IsValid) {
                            var ctx = getUserContext(msg);
                            // we have a command and a context to work with. lets start processing.
                            process(ctx, r);
                            SaveState();
                        }
                    }
                }
                //}
                //catch (err)
                //{
                //    log(err);
                //    ctx.SendChat("Invalid command: " + err.message);
                //}
            });
            isInitialized = true;
            log("VirtualBard Ready");
        });
    };
    export let isInitialized : boolean = false;
    export function DumpEnvironment() : void
    {
        log("========= DUMPING ENVIRONMENT ===========");
        log(`Timestamp: ${new Date()}`);
        log("======= BEGIN GAME STATE =========");
        log(SmartStringify(state));
        log("======= BEGIN VIRTUALBARD ENVIRONMENT =========");
        log(SmartStringify(VirtualBard));
        log("========= END DUMP ===========");
        log("If you are collecting this as part of submitting a bug or issue, use a service like http://pastebin.com/ to provide a link to the full dump when submitting");
    }
    export function SmartStringify(obj : any) : string
    {
        var seen = [];

        return JSON.stringify(obj, function(key, val) {
        if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0) {
                    return "[DISCARDED]";
                }
                seen.push(val);
            }
            return val;
        });
    }





}