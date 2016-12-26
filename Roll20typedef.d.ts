interface Roll20Object {
    /** Readonly. Cannot be assiged at object instantiation. Use _id when querying */
    id?: string;
    /** Use THIS when querying */
    _id?: string;
    /** Readonly. Cannot be assiged at object instantiation. Use _type when querying */
    type?: string;
    /** Use THIS when querying */
    _type?: string;
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
    current: any; 
    characterid:string;
}
interface Handout extends Roll20Object {
    /**URL to an image used for the handout. See the note about avatar and imgsrc restrictions below. */
    avatar?: string;	
    /** The name of the handout. Default: "Mysterious Note" */
    name?: string; 
    /** Contains the text in the handout. See the note below about using Notes and GMNotes.
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
declare function findObjs<T extends Roll20Object>(attributes: T) : T;
/**
 * Non Typesafe declaration. Pass this function a list of attributes, and it will return all objects that match as an array. Note that this operates on all objects of all types across all pages -- so you probably want to include at least a filter for _type and _pageid if you're working with tabletop objects.
 * @param {any} attributes - The properties being queried
 */
declare function findObjs(attributes: any) : any;



