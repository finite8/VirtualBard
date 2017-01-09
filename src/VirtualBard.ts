/// <reference path="Roll20typedef.d.ts" />
/// <reference path="../typings/globals/underscore/index.d.ts" />
namespace VirtualBard {

    function Setup(completionCallback: () => void): void {
        on("ready", function () {
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
                            log("New data to assign: " + notes);
                            settingsHandout.set("gmnotes", "<Settings>" + notes + "</Settings>");
                            if (isAssigned(completionCallback)) {
                                completionCallback();
                            }
                        }, 100);
                    }
                    else {
                        log("Existing: " + JSON.stringify(loadedSettings));
                        settings = _.extend(DefaultSettings(), loadedSettings);

                        if (isAssigned(completionCallback)) {
                            completionCallback();
                        }
                        return;
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
    class Duration {
        public constructor() {
            this.Year = 0;
            this.Month = 0;
            this.Week = 0;
            this.Day = 0;
            this.Hour = 0;
        }
        public Year: number;
        public Month: number;
        public Week: number;
        public Day: number;
        public Hour: number;
        private static nth(d: number): string {
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
        }

        public GetDisplayText(): string {
            let port = Duration.GetDayTimePortion(this.Hour);
            let diff = this.Hour - port.StartHour;
            let hourPortionText = diff == 0 ? "" : diff + " hours after ";
            return "" + hourPortionText + port.Name
                + " " + (this.Day + 1) + Duration.nth(this.Day + 1)
                + " of " + settings.CalendarConfiguration.MonthNames[this.Month]
                + " " + this.Year + settings.CalendarConfiguration.YearSuffix;
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
        public CurrentDuration: Duration = new Duration();
        public AddHours(hours: number): void {
            this.CurrentDuration.Hour += hours;
            this.CurrentDuration.BalanceTime();
        }



        /** Progresses the day to the next time period (i.e: Dawn -> Morning). This will progress through to the next day */
        public ProgressDayPortion(): void {
            let currentPortion = Duration.GetDayTimePortion(this.CurrentDuration.Hour);
            this.AddHours(currentPortion.EndHour - this.CurrentDuration.Hour);
        }
        /** Sets the current hour in the day to a different time. Will not progress to the next day*/
        public SetTime(hour: number): void {
            this.CurrentDuration.Hour = hour;
            this.CurrentDuration.BalanceTime();
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
    /** The adventure state is designed to manage the current progress of the adventure. This can be interacted by specific Commands
     * and other elements of VirtualBard will use this to log more specific information
     */
    class AdventureState {
        public constructor() {
            this.Calendar = new AdventureCalendar();
        }
        public Calendar: AdventureCalendar;
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
        constructor(char: Character) {
            super();
            this.CharSheet = char;
            this.LoadData();
        }
        CharSheet: Character;
        protected LoadData(): void {
            let refObj = this;
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
            });
        }
        protected SaveData(data: CharacterData): void {
            let refObj = this;
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
    }
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
                , { mode: CharacterMode.Handout, canCreate: false } // then try to find a handout
                , { mode: CharacterMode.SingleHandout, canCreate: false } // then try to find a single handout
                , { mode: CharacterMode.Sheet, canCreate: true } // otherwise, fall back and create the character sheet
            ],
            AdventureLog: "Adventure Log"
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
    let settings = DefaultSettings();
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
    function isAssigned(obj) {
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
        IsHelp: boolean;
        Type: MessageType;
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
        result.IsHelp = false;
        if (msg.content.indexOf("!h") == 0) {
            result.IsHelp = true;
            result.Type = MessageType.All;
        }
        else if (msg.content.indexOf("!c") == 0) {
            result.Type = MessageType.Character;
        }
        else if (msg.content.indexOf("!test") == 0) {
            result.Type = MessageType.Test;
        }
        else {
            result.IsValid = false;
            return result;
        }
        result.IsValid = true;
        result.UserContextId = msg.playerid;
        result.UserName = msg.who;
        var cmd = new MessageCommand();
        result.Commands = [];
        // we now search for the next '-' starting element.
        var parts = msg.content.trim().split(" ");
        var index;
        if (parts.length >= 2 && parts[1] == "-h") {
            result.IsHelp = true;
            index = 2;
        }
        else {
            index = 1;
        }
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


        log(result);
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
    function process(context: UserContext, data: MessageInfo) {
        context.Current = {};
        let processingFunction: (ctx: UserContext, cmd: MessageCommand) => void;
        var postAction;
        switch (data.Type) {
            case MessageType.Character:
                if (data.IsHelp) {
                    printJournalHelp(data);
                }
                else {
                    context.Current.SentenceParts = {};
                    processingFunction = function (ctx, cmd) { processCharacterAction(ctx, cmd) };
                    postAction = function (ctx) { p_characterFunctions.logResults(ctx) };
                }
                break;
            case MessageType.Test:
                testCode();
                break;
            default:
                throw "Command " + data.Type + " not implemented";
        }

        if (typeof processingFunction !== 'undefined') {
            var errors = [];
            for (var i = 0; i < data.Commands.length; i++) {
                try {
                    var cmd = data.Commands[i];
                    processingFunction(context, cmd);
                }
                catch (er) {
                    let err: Error = er;
                    errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + err.message + ", stack=" + err.stack);
                }
            }
            if (isDefined(postAction)) {
                postAction(context);
            }
            if (errors.length > 0) {
                throw "Following errors were encountered:\r\n" + errors.join("\r\n");
            }
        }

    }
    function printJournalHelp(data) {
        sendMessage(data.UserName, "!j +met <name> --- Adds a new event for meeting a person. Creates a new person entry switches context to them")
    }
    function processCharacterAction(ctx: UserContext, cmd: MessageCommand) {
        if (cmd.Type == "-met") {
            p_characterFunctions.metAction(ctx, cmd);
        }
        else if (cmd.Type == "-who") {
            p_characterFunctions.whoAction(ctx, cmd);
        }
        else if (cmd.Type == "-r") {
            p_characterFunctions.raceAction(ctx, cmd);
        }
        else if (cmd.Type == "-s") {
            p_characterFunctions.sexAction(ctx, cmd);
        }
        else if (cmd.Type == "-c") {
            p_characterFunctions.classAction(ctx, cmd);
        }
        else {
            throw "Character command not recognized: " + cmd.Type;
        }
    }
    var p_characterFunctions = {
        logResults: function (context) {
            var sp = context.Current.SentenceParts;
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
        },
        appendBio: function (char, text) {

        },
        whoAction: function (ctx: UserContext, cmd: MessageCommand) {

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
        },
        classAction: function (ctx: UserContext, cmd: MessageCommand) {
            this.assertCurrentCharDefined(ctx, cmd);
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
        },
        metAction: function (ctx: UserContext, cmd: MessageCommand) {
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.getCharacterInfo(charName);
            log("Char Info: " + r);
            if (!r.IsNew) {
                sendMessage(ctx.UserName, "The party is already aware of " + charName);
            }
            else {
                //broadcastMessage("The party met " + charName);
                //ctx.Current.SentenceParts.Name = charName;
            }
            ctx.Current.SentenceParts.Name = charName;
            ctx.CurrentChar = r.Char;

        },

        sexAction: function (ctx: UserContext, cmd: MessageCommand) {
            this.assertCurrentCharDefined(ctx, cmd);
            var sex = this.parseSex(cmd.Params[0]);
            ctx.Current.SentenceParts.Sex = sex;
            ctx.CurrentChar.SetAttribute("sex", sex);
        },

        raceAction: function (ctx: UserContext, cmd: MessageCommand) {
            this.assertCurrentCharDefined(ctx, cmd);
            ctx.Current.SentenceParts.Race = cmd.Params.join(" ");
            ctx.CurrentChar.SetAttribute("race", ctx.Current.SentenceParts.Race);
        }
        , parseSex: function (text) {
            var sex = settings.sexTypes[text.toLowerCase()];
            if (typeof sex == 'undefined') {
                throw text + " could not be interpreted as a valid sex";
            }
            return sex;
        }
        , assertCurrentCharDefined: function (ctx, cmd) {
            if (typeof ctx.CurrentChar == 'undefined') {
                throw cmd.Type + " requires a Character context to be set";
            }
        }


    };

    var p_journalFunctions = {
        currentSentence: "",
        appendJournalText: function (text) {
            this.currentSentence = this.currentSentence + text;
            var j = this.getJournalHandout();
            j.get("notes", function (n) {
                log("Existing Notes:" + n);
                setTimeout(function () {
                    j.set("notes", n + text);
                }, 100);

            });

            //j.notes = (j.notes || "") + text;
            log("Writting to log:" + text);
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
            var handouts = findObjs<Handout>({ _type: "handout", name: settings.AdventureLog });
            if (handouts.length == 0) {
                var h = createObj("handout", { name: settings.AdventureLog, inplayerjournals: "all", controlledby: "all", notes: "" });
                this.journalHandout = h;
            }
            else {
                log("found existing");
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
        getHandout: function (handoutName: string, isHidden: boolean, isEditable: boolean): Handout {
            let hos = findObjs<Handout>({ _type: "handout", name: handoutName });

            log(hos);
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
            log(shts);
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
        getCharacterInfo: function (charName: string): CharacterFindResult {

            for (var i = 0; i < settings.CharacterResolutionOrder.length; i++) {
                let m = settings.CharacterResolutionOrder[i];
                log("Attmepting to resolve character '" + charName + "' using mode '" + CharacterMode[m.mode] + "'")
                switch (m.mode) {
                    case CharacterMode.Sheet:
                        var char = this.findCharacterSheet(charName);
                        let isNew: boolean;
                        if (char == null) {
                            log("Could not find Character sheet for " + charName)
                            if (m.canCreate) {
                                log("Creating...");
                                char = createObj<Character>("character", { name: charName, inplayerjournals: "all", controlledby: "all" });
                                this.setCharacterAttribute(char, VBAttributes.IsMet, true);
                                isNew = true;
                            }
                            else {
                                log("canCreate=false. Continuing...");
                                continue;
                            }
                        }
                        else {
                            log("Found!")
                            isNew = !(this.getCharacterAttribute(char, VBAttributes.IsMet) == true);
                        }
                        var ret = new CharacterFindResult();
                        ret.IsNew = isNew;
                        ret.Char = new CharacterSheetReference(char);
                        return ret;

                    default:

                        log("CharacterSheetMode " + m + " is not yet implemented");
                }
            }
            throw "VirtualBard was unable to resolve the character " + charName + ". Try adding more ResolutionOptions or allowing VirtualBard to create sheets or handouts."


        },
        getCharacterAttribute: function (char: Character, attribName: string): any {
            assertVariableAssigned(char, "char");
            if (!isDefined(char.id)) {
                log(char);
                throw "id was undefined on char parameter";
            }
            var result = getAttrByName(char.id, attribName);
            return result;

        },
        setCharacterAttribute: function (char: Character, attribName: string, newValue: any): void {

            var attribs = findObjs<Attribute>({ _type: "attribute", _characterid: char.id, name: attribName });
            log("setting attribute");
            log(char);
            //log(findObjs({_type:"attribute", _characterid:char.id}));
            if (attribs.length == 0) {
                // we instead need to insert it
                var newAttrib = createObj<Attribute>("attribute", { name: attribName, current: newValue, characterid: char.id });
                log("Inserting attribute" + attribName);
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
    export function Initialize() {
        Setup(function () {
            on("chat:message", function (msg) {
                log(msg);
                //try
                //{
                var r = parseMessage(msg);
                if (r.IsValid) {
                    var ctx = getUserContext(msg);
                    // we have a command and a context to work with. lets start processing.
                    process(ctx, r);
                }
                //}
                //catch (err)
                //{
                //    log(err);
                //    ctx.SendChat("Invalid command: " + err.message);
                //}
            });
        });
    };





}