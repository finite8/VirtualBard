var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="Roll20typedef.d.ts" />
/// <reference path="../typings/globals/underscore/index.d.ts" />
var vb = (function () {
    function Initialize(completionCallback) {
        on("ready", function () {
            var settingsHandout = p_sysFunctions.getHandout("VBSettings", true, false);
            settingsHandout.get("gmnotes", function (d) {
                try {
                    var loadedSettings = JSON.parse(_.unescape(d));
                    settings = _.extend(DefaultSettings(), loadedSettings);
                    log(settings);
                    if (isAssigned(completionCallback)) {
                        completionCallback();
                    }
                }
                catch (err) {
                    // we dont REALLY care about the error. we will however use it to indicate that a default settings entry needs to be created.
                    settings = DefaultSettings();
                    setTimeout(function () {
                        var notes = _.escape(JSON.stringify(settings));
                        log(notes);
                        settingsHandout.set("gmnotes", notes);
                        if (isAssigned(completionCallback)) {
                            completionCallback();
                        }
                    }, 100);
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
            AdventureLog: "Adventure Log"
        };
    }
    ;
    var settings = DefaultSettings();
    //   var messageTypes = {
    //     test : "test",
    //     character   : "Character Event"
    //   };
    var VBAttributes = {
        IsMet: "VB-IsMet"
    };
    function testCode() {
    }
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
     * As character containers can take several forms (Character sheets, Handout sheets, or nothing), this is used
     * to abstract that behaviour accordingly.
     */
    var CharacterDataContainer = (function () {
        function CharacterDataContainer() {
        }
        return CharacterDataContainer;
    }());
    var CharacterSheetContainer = (function (_super) {
        __extends(CharacterSheetContainer, _super);
        function CharacterSheetContainer(char) {
            var _this = _super.call(this) || this;
            _this.CharSheet = char;
            return _this;
        }
        CharacterSheetContainer.prototype.setAttribute = function (attribName, attribValue) {
        };
        return CharacterSheetContainer;
    }(CharacterDataContainer));
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
        return HTMLTextEditor;
    }());
    /**
     *  returns a object that describes the results. The returned object supports additional searcing and text modification functions.
     */
    function findTag(baseText, tag, attributes, basis) {
        var regString = "(<" + tag + "(\\b[^>]*)>)([\\s\\S]*?)(<\\\/" + tag + ">)";
        var r = new RegExp(regString, "gim");
        var match = r.exec(baseText);
        if (match == null) {
            log("no match");
            return null;
        }
        if (isAssigned(attributes)) {
            // lets go through each property pair.
            for (var p in attributes) {
                if (attributes.hasOwnProperty(p)) {
                    var attribReg = new RegExp(p + "=\"" + attributes[p] + "\"");
                    if (attribReg.exec(match[2]) == null) {
                        log("missing attribute");
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
        // var result = {
        //     originalText : useOriginalText,
        //     tagAttributes : match[2],
        //     tag : tag,
        //     endTag : match[4],
        //     text : match[3],
        //     startIndex : match.index + offset,
        //     innerStartIndex : match.index + match[1].length + offset,
        //     innerEndIndex : (match.index + match[0].length - match[4].length) + offset,
        //     endIndex : match.index + match[0].length + offset,
        //     getText : function () {return this.originalText.value;},
        //     findTag : function(subTag, subAttributes) {
        //         return findTag(result.text, subTag, subAttributes, result);
        //     },
        //     appendText : function(textToAppend) {
        //         var txtToModify = this.originalText.value;
        //         this.originalText.value = txtToModify.slice(0, this.innerEndIndex) + textToAppend + txtToModify.slice(this.innerEndIndex)
        //         this.innerEndIndex += textToAppend.length;
        //         this.endIndex = this.innerEndIndex + endTag.length;
        //         this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
        //         return result;
        //     },
        //     setText : function(textToSet) {
        //         var txtToModify = this.originalText.value;
        //         this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToSet + txtToModify.slice(this.innerEndIndex)
        //         this.innerEndIndex = this.innerStartIndex + textToSet.length;
        //         this.endIndex = this.innerEndIndex + endTag.length;
        //         this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
        //         return result;
        //     },
        //     prependText : function(textToPrepend) {
        //         var txtToModify = this.originalText.value;
        //         this.originalText.value = txtToModify.slice(0, this.innerStartIndex) + textToPrepend + txtToModify.slice(this.innerStartIndex)
        //         this.innerEndIndex += textToPrepend.length;
        //         this.endIndex = this.innerEndIndex + endTag.length;
        //         this.text = this.originalText.value.substring(this.innerStartIndex, this.innerEndIndex);
        //         return result;
        //     }
        // };
        log(result);
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
    function process(context, data) {
        context.Current = {};
        var processingFunction;
        var postAction;
        switch (data.Type) {
            case MessageType.Character:
                if (data.IsHelp) {
                    printJournalHelp(data);
                }
                else {
                    context.Current.SentenceParts = {};
                    processingFunction = function (ctx, cmd) { processCharacterAction(ctx, cmd); };
                    postAction = function (ctx) { p_characterFunctions.logResults(ctx); };
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
                catch (err) {
                    errors.push("cmd=(" + cmd.Type + " " + cmd.Params.join(" ") + "), err=" + err.message);
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
        sendMessage(data.UserName, "!j +met <name> --- Adds a new event for meeting a person. Creates a new person entry switches context to them");
    }
    function processCharacterAction(ctx, cmd) {
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
        whoAction: function (ctx, cmd) {
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.findCharacterSheet(charName);
            if (isDefined(r)) {
                // we have the character
                ctx.CurrentChar = r;
                ctx.SendChat("Character context set to: " + r.name);
            }
            else {
                ctx.SendChat("No character exists with name: " + charName);
            }
        },
        classAction: function (ctx, cmd) {
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
            p_sysFunctions.setCharacterAttribute(ctx.CurrentChar, "class", realClass);
            p_sysFunctions.setCharacterAttribute(ctx.CurrentChar, "inputClass", cmd.Params[0]);
        },
        metAction: function (ctx, cmd) {
            var charName = cmd.Params.join(" ");
            var r = p_sysFunctions.getCharacterInfo(charName);
            log("Char Info: " + r);
            if (!r.IsNew) {
                sendMessage(ctx.UserName, "The party is already aware of " + charName);
            }
            else {
            }
            ctx.Current.SentenceParts.Name = charName;
            ctx.CurrentChar = r.Char;
        },
        sexAction: function (ctx, cmd) {
            this.assertCurrentCharDefined(ctx, cmd);
            var sex = this.parseSex(cmd.Params[0]);
            ctx.Current.SentenceParts.Sex = sex;
            p_sysFunctions.setCharacterAttribute(ctx.CurrentChar, "sex", sex);
        },
        raceAction: function (ctx, cmd) {
            this.assertCurrentCharDefined(ctx, cmd);
            ctx.Current.SentenceParts.Race = cmd.Params.join(" ");
            p_sysFunctions.setCharacterAttribute(ctx.CurrentChar, "race", ctx.Current.SentenceParts.Race);
        },
        parseSex: function (text) {
            var sex = settings.sexTypes[text.toLowerCase()];
            if (typeof sex == 'undefined') {
                throw text + " could not be interpreted as a valid sex";
            }
            return sex;
        },
        assertCurrentCharDefined: function (ctx, cmd) {
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
            var handouts = findObjs({ _type: "handout", name: settings.AdventureLog });
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
        getHandout: function (handoutName, isHidden, isEditable) {
            var hos = findObjs({ _type: "handout", name: handoutName });
            log(hos);
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
                return createObj("handout", { name: handoutName, inplayerjournals: inplayerjournalsStr, controlledby: isEditableStr });
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
        getCharacterInfo: function (charName) {
            for (var i = 0; i < settings.CharacterResolutionOrder.length; i++) {
                var m = settings.CharacterResolutionOrder[i];
                switch (m.mode) {
                    case CharacterMode.Sheet:
                        var char = this.findCharacterSheet(charName);
                        var isNew = void 0;
                        if (char == null) {
                            log("Could not find Character sheet for " + charName);
                            if (m.canCreate) {
                                char = createObj("character", { name: charName, inplayerjournals: "all", controlledby: "all" });
                                this.setCharacterAttribute(char, VBAttributes.IsMet, true);
                                isNew = true;
                            }
                            else {
                                log("CanCreateCharacterSheets=false. Continuing...");
                            }
                        }
                        else {
                            isNew = !(this.getCharacterAttribute(char, VBAttributes.IsMet) == true);
                        }
                        var ret = new CharacterFindResult();
                        ret.IsNew = isNew;
                        ret.Char = new CharacterSheetContainer(char);
                        return ret;
                    default:
                        throw "CharacterSheetMode " + m + " is not yet implemented";
                }
            }
            throw "VirtualBard was unable to resolve the character " + charName + ". Try adding more ResolutionOptions or allowing VirtualBard to create sheets or handouts.";
        },
        getCharacterAttribute: function (char, attribName) {
            assertVariableAssigned(char, "char");
            if (!isDefined(char.id)) {
                log(char);
                throw "id was undefined on char parameter";
            }
            var result = getAttrByName(char.id, attribName);
            return result;
        },
        setCharacterAttribute: function (char, attribName, newValue) {
            var attribs = findObjs({ _type: "attribute", _characterid: char.id, name: attribName });
            log("setting attribute");
            log(char);
            //log(findObjs({_type:"attribute", _characterid:char.id}));
            if (attribs.length == 0) {
                // we instead need to insert it
                var newAttrib = createObj("attribute", { name: attribName, current: newValue, characterid: char.id });
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
    Initialize(function () {
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
}());
