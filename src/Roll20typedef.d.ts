interface Roll20Object {
    /** Readonly. Cannot be assiged at object instantiation. Use _id when querying */
    id?: string;
    /** Use THIS when querying */
    _id?: string;
    /** Readonly. Cannot be assiged at object instantiation. Use _type when querying */
    type?: string;
    /** Use THIS when querying */
    _type?: string;
    /** Retrieves a field value. */
    get?(field : string, callback : (value: any) => void );
    set?(field : string, value: any);
}

interface Character extends Roll20Object {
    /** the name of the character as it will appear in the "Name" field */
    name : string;
    /** Comma delimited list of players that this character sheet can be viewed by. Use the string "all" to make it available for all */
    inplayerjournals : string;
    controlledby : string;
}
interface Attribute extends Roll20Object {
    name: string;
    current?: any; 
    characterid?:string;
    _characterid?:string;
}
interface Handout extends Roll20Object {
    /**URL to an image used for the handout. See the note about avatar and imgsrc restrictions below. */
    avatar?: string;	
    /** The name of the handout. Default: "Mysterious Note" */
    name?: string; 
    /** Contains the text in the handout. See the note below about using Notes and GMNotes. Note: In order to get this value, you MUST use the {@see Roll20Object#get(string, (any) => void)} method. 
     */ 		
    notes?: string;
    /** Contains the text in the handout that only the GM sees. See the note below about using Notes and GMNotes. */
    gmnotes?: string; 
    /** Comma-delimited list of player ID who can see this handout. Use "all" to display to all players. */
    inplayerjournals?: string;
    /** default: false */
    archived?: boolean;	
    /** Comma-delimited list of player ID who can edit this handout. Use "all" to allow all players to edit. */
    controlledby?: string;
}
interface ChatOptions {
    noarchive: boolean;
    use3d: boolean;
}
interface MessageCallback {
    (ops: string): void;
}
declare function sendChat(sendas: string, message: string, callback?: MessageCallback, options?: ChatOptions) : void;
/**
 * Creates a new Roll20 object. 
 * Source: https://wiki.roll20.net/API:Objects#Creating_Objects
 * @param {string} type - The Type of Roll20 object to create. For consistency, this definition file has implemented the class names to be the same name as what you need to provide here.
 * @param {Roll20Object} attributes - The properties the new Roll20 object will be created with.
 *
 */
declare function createObj<T extends Roll20Object>(type: string, attributes: T) : T;
/**
 * Prints a message to the Roll20 Script console output.
 * @param {any} message - The data you want printed to the console. This will be formatted to string as best as possible (JSON data will be formatted appropriately) 
 */
declare function log(message: any) : void;
/**
 * Pass this function a list of attributes, and it will return all objects that match as an array. Note that this operates on all objects of all types across all pages -- so you probably want to include at least a filter for _type and _pageid if you're working with tabletop objects.
 * @param {T} attributes - The properties being queried
 */
declare function findObjs<T extends Roll20Object>(attributes: T) : T[];
/**
 * Non Typesafe declaration. Pass this function a list of attributes, and it will return all objects that match as an array. Note that this operates on all objects of all types across all pages -- so you probably want to include at least a filter for _type and _pageid if you're working with tabletop objects.
 * @param {any} attributes - The properties being queried
 */
declare function findObjs(attributes: any) : any;

/**
 * Gets the value of an attribute, using the default value from the character sheet if the attribute is not present.
 * getAttrByName will only get the value of the attribute, not the attribute object itself. If you wish to reference properties of the attribute other than "current" or "max", or if you wish to change properties of the attribute, you must use one of the other functions above, such as findObjs.
 * Note that there is an inconsistency of usage when attempting to get a value from a repeating section whose name contains mixed case. The name of the repeating section needs to be passed all lower case. The rest of the attribute_name needs to be in it's original case. (IE: "repeating_Skills_XyZ_Name" will not work. "repeating_skills_XyZ_Name" will work and will fetch the value in "repeating_Skills_XyZ_Name").
 * Source: https://wiki.roll20.net/API:Objects#getAttrByName.28character_id.2C_attribute_name.2C_value_type.29
 * @param {string} character_id - The Roll20 Character Id to get the attribute for
 * @param {string} attribute_name - The name of the Attribute to retrieve
 * @param {string} value_type - Either "current" to get the current value, or "max" to get the max bound for this attribute value (i.e: current "HP" and max "HP")
 */
declare function getAttrByName(character_id: string, attribute_name: string, value_type?: string): any;
/**
 * Adds an event callback into the Roll20 Scripting API. When this event occurs, the given function will be called.
 * For a full listing of events, see https://wiki.roll20.net/API:Events
 * 
 * Examples: "chat:message" accepts a callback that takes a string as a parameter for chat input
 */
declare function on(eventType: string, callback: (...args: any[]) => any): void;