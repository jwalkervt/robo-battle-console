/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// To parse this data:
//
//   import { Convert, TickEventForObserverSchemaYAML, GameStartedEventForObserverSchemaYAML, GameEndedEventForObserverSchemaYAML, BotStateSchemaYAML, BulletStateSchemaYAML, BotInfoSchemaYAML, GameSetupSchemaYAML, ObserverHandshakeSchemaYAML, BulletFiredEventSchemaYAML, BulletHitBotEventSchemaYAML, BulletHitWallEventSchemaYAML, BotDeathEventSchemaYAML, BotHitBotEventSchemaYAML, BotHitWallEventSchemaYAML } from "./file";
//
//   const tickEventForObserverSchemaYAML = Convert.toTickEventForObserverSchemaYAML(json);
//   const gameStartedEventForObserverSchemaYAML = Convert.toGameStartedEventForObserverSchemaYAML(json);
//   const gameEndedEventForObserverSchemaYAML = Convert.toGameEndedEventForObserverSchemaYAML(json);
//   const botStateSchemaYAML = Convert.toBotStateSchemaYAML(json);
//   const bulletStateSchemaYAML = Convert.toBulletStateSchemaYAML(json);
//   const botInfoSchemaYAML = Convert.toBotInfoSchemaYAML(json);
//   const gameSetupSchemaYAML = Convert.toGameSetupSchemaYAML(json);
//   const observerHandshakeSchemaYAML = Convert.toObserverHandshakeSchemaYAML(json);
//   const bulletFiredEventSchemaYAML = Convert.toBulletFiredEventSchemaYAML(json);
//   const bulletHitBotEventSchemaYAML = Convert.toBulletHitBotEventSchemaYAML(json);
//   const bulletHitWallEventSchemaYAML = Convert.toBulletHitWallEventSchemaYAML(json);
//   const botDeathEventSchemaYAML = Convert.toBotDeathEventSchemaYAML(json);
//   const botHitBotEventSchemaYAML = Convert.toBotHitBotEventSchemaYAML(json);
//   const botHitWallEventSchemaYAML = Convert.toBotHitWallEventSchemaYAML(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TickEventForObserverSchemaYAMLObject {
    /**
     * Current state of all bots
     */
    botStates: Array<any[] | boolean | number | number | null | BotStateObject | string>;
    /**
     * Current state of all bullets
     */
    bulletStates: Array<any[] | boolean | number | number | null | BulletStateSchema | string>;
    /**
     * All events occurring at this tick
     */
    events: Array<any[] | boolean | number | number | null | EventObject | string>;
    /**
     * The current round number in the battle when event occurred
     */
    roundNumber: number;
    [property: string]: any;
}

export interface BotStateObject {
    /**
     * Debug graphics to be drawn as overlay on the battlefield if debugging is enabled
     */
    debugGraphics?: string;
    /**
     * Unique display id of bot in the battle (like an index).
     */
    id: number;
    /**
     * Unique session id used for identifying the bot.
     */
    sessionId: string;
    /**
     * Last data received for standard err (stderr)
     */
    stdErr?: string;
    /**
     * Last data received for standard out (stdout)
     */
    stdOut?: string;
    [property: string]: any;
}

export interface BulletStateSchema {
    /**
     * id of the bullet
     */
    bulletId: number;
    /**
     * Color of the bullet
     */
    color?: string;
    /**
     * Direction in degrees
     */
    direction: number;
    /**
     * id of the bot that fired the bullet
     */
    ownerId: number;
    /**
     * Bullet firepower (between 0.1 and 3.0)
     */
    power: number;
    /**
     * X coordinate
     */
    x: number;
    /**
     * Y coordinate
     */
    y: number;
    [property: string]: any;
}

export interface EventObject {
    /**
     * The turn number in current round when event occurred
     */
    turnNumber: number;
    [property: string]: any;
}

export interface GameStartedEventForObserverSchemaYAMLObject {
    /**
     * Game setup
     */
    gameSetup: any[] | boolean | number | number | null | GameSetupSchema | string;
    /**
     * List of bots participating in this battle
     */
    participants: Array<any[] | boolean | number | number | null | ParticipantObject | string>;
    [property: string]: any;
}

export interface GameSetupSchema {
    /**
     * Height of arena measured in units
     */
    arenaHeight: number;
    /**
     * Width of arena measured in units
     */
    arenaWidth: number;
    /**
     * Default number of turns to show per second for an observer/UI
     */
    defaultTurnsPerSecond: number;
    /**
     * Type of game
     */
    gameType: string;
    /**
     * Gun cooling rate. The gun needs to cool down to a gun heat of zero before the gun is able
     * to fire
     */
    gunCoolingRate: number;
    /**
     * Flag specifying if the height of arena is fixed for this game type
     */
    isArenaHeightLocked: boolean;
    /**
     * Flag specifying if the width of arena is fixed for this game type
     */
    isArenaWidthLocked: boolean;
    /**
     * Flag specifying if the gun cooling rate is fixed for this game type
     */
    isGunCoolingRateLocked: boolean;
    /**
     * Flag specifying if the inactive turns is fixed for this game type
     */
    isMaxInactivityTurnsLocked: boolean;
    /**
     * Flag specifying if the maximum number of bots participating in battle is fixed for this
     * game type
     */
    isMaxNumberOfParticipantsLocked: boolean;
    /**
     * Flag specifying if the minimum number of bots participating in battle is fixed for this
     * game type
     */
    isMinNumberOfParticipantsLocked: boolean;
    /**
     * Flag specifying if the number-of-rounds is fixed for this game type
     */
    isNumberOfRoundsLocked: boolean;
    /**
     * Flag specifying if the ready timeout is fixed for this game type
     */
    isReadyTimeoutLocked: boolean;
    /**
     * Flag specifying if the turn timeout is fixed for this game type
     */
    isTurnTimeoutLocked: boolean;
    /**
     * Maximum number of inactive turns allowed, where a bot does not take any action before it
     * is zapped by the game
     */
    maxInactivityTurns: number;
    /**
     * Maximum number of bots participating in battle (is optional)
     */
    maxNumberOfParticipants?: number;
    /**
     * Minimum number of bots participating in battle
     */
    minNumberOfParticipants: number;
    /**
     * Number of rounds in battle
     */
    numberOfRounds: number;
    /**
     * Time limit in microseconds (µs) (where 1 microsecond equals 1/1,000,000 of a second) for
     * sending a 'ready' message after receiving a 'new battle' message.
     */
    readyTimeout: number;
    /**
     * Timeout duration in microseconds (µs) (where 1 microsecond equals 1/1,000,000 of a
     * second) for sending intent after receiving a 'tick' message.
     */
    turnTimeout: number;
    [property: string]: any;
}

export interface ParticipantObject {
    /**
     * Name of authors, e.g. John Doe (john_doe@somewhere.net)
     */
    authors: string[];
    /**
     * 2-letter country code(s) defined by ISO 3166-1, e.g. "GB"
     */
    countryCodes?: string[];
    /**
     * Short description of the bot, preferable a one-liner
     */
    description?: string;
    /**
     * Game types supported by this bot (defined elsewhere), e.g. "classic", "melee" and "1v1"
     */
    gameTypes?: string[];
    /**
     * URL to a home page for the bot
     */
    homepage?: string;
    /**
     * Id of the bot participating in a battle
     */
    id: number;
    /**
     * Initial start position of the bot used for debugging
     */
    initialPosition?: any[] | boolean | number | number | null | InitialPositionSchema | string;
    /**
     * Flag specifying if the bot is a Droid (team bot with 120 energy, but no scanner)
     */
    isDroid?: boolean;
    /**
     * Name of bot, e.g. Killer Bee
     */
    name: string;
    /**
     * Platform used for running the bot, e.g. JVM 17 or .NET 5
     */
    platform?: string;
    /**
     * Language used for programming the bot, e.g. Java 17 or C# 10
     */
    programmingLang?: string;
    /**
     * Unique session id that must match the session id received from the server handshake
     */
    sessionId: string;
    /**
     * Id of the team that this bot is a member of
     */
    teamId?: number;
    /**
     * Name of the team that this bot is a member of, e.g. Killer Bees
     */
    teamName?: string;
    /**
     * Team version, e.g. 1.0
     */
    teamVersion?: string;
    /**
     * Bot version, e.g. 1.0
     */
    version: string;
    [property: string]: any;
}

export interface InitialPositionSchema {
    /**
     * The shared direction of the body, gun, and radar. When it is not set, a random value will
     * be used.
     */
    direction?: number;
    /**
     * The x coordinate. When it is not set, a random value will be used.
     */
    x?: number;
    /**
     * The y coordinate. When it is not set, a random value will be used.
     */
    y?: number;
    [property: string]: any;
}

export interface GameEndedEventForObserverSchemaYAMLObject {
    /**
     * Number of rounds played
     */
    numberOfRounds: number;
    /**
     * Results of the battle for all bots
     */
    results: Array<any[] | boolean | number | number | null | ResultObject | string>;
    [property: string]: any;
}

export interface ResultObject {
    /**
     * Id of the participant
     */
    id: number;
    /**
     * Name of participant, e.g. Killer Bee (bot) or Killer Bees (team)
     */
    name: string;
    /**
     * version, e.g. 1.0
     */
    version: string;
    [property: string]: any;
}

export interface BotStateSchemaYAMLObject {
    /**
     * Current RGB color of the body, if changed
     */
    bodyColor?: string;
    /**
     * New color of the bullets, if changed. Note that bullets that has already been fired
     * should not change colors.
     */
    bulletColor?: string;
    /**
     * Driving direction in degrees
     */
    direction: number;
    /**
     * Number of enemy bots left in the current round
     */
    enemyCount: number;
    /**
     * Energy level
     */
    energy: number;
    /**
     * New color of gun, if changed
     */
    gunColor?: string;
    /**
     * Gun direction in degrees
     */
    gunDirection: number;
    /**
     * Gun heat
     */
    gunHeat: number;
    /**
     * Turn rate of the gun in degrees per turn (can be positive and negative)
     */
    gunTurnRate: number;
    /**
     * Flag specifying if the bot is allowed to use debugging features
     */
    isDebuggingEnabled?: boolean;
    /**
     * Flag specifying if the bot is a Droid (team bot with 120 energy, but no scanner)
     */
    isDroid?: boolean;
    /**
     * New color of the radar, if changed
     */
    radarColor?: string;
    /**
     * Radar direction in degrees
     */
    radarDirection: number;
    /**
     * Radar sweep angle in degrees, i.e. angle between previous and current radar direction
     */
    radarSweep: number;
    /**
     * Turn rate of the radar in degrees per turn (can be positive and negative)
     */
    radarTurnRate: number;
    /**
     * New color of the scan arc, if changed
     */
    scanColor?: string;
    /**
     * Speed measured in units per turn
     */
    speed: number;
    /**
     * New color of the tracks, if changed
     */
    tracksColor?: string;
    /**
     * Turn rate of the body in degrees per turn (can be positive and negative)
     */
    turnRate: number;
    /**
     * New color of the gun turret, if changed
     */
    turretColor?: string;
    /**
     * X coordinate
     */
    x: number;
    /**
     * Y coordinate
     */
    y: number;
    [property: string]: any;
}

export interface BulletStateSchemaYAMLObject {
    /**
     * id of the bullet
     */
    bulletId: number;
    /**
     * Color of the bullet
     */
    color?: string;
    /**
     * Direction in degrees
     */
    direction: number;
    /**
     * id of the bot that fired the bullet
     */
    ownerId: number;
    /**
     * Bullet firepower (between 0.1 and 3.0)
     */
    power: number;
    /**
     * X coordinate
     */
    x: number;
    /**
     * Y coordinate
     */
    y: number;
    [property: string]: any;
}

export interface BotInfoSchemaYAMLObject {
    /**
     * Host name or IP address
     */
    host: string;
    /**
     * Port number
     */
    port: number;
    [property: string]: any;
}

export interface GameSetupSchemaYAMLObject {
    /**
     * Height of arena measured in units
     */
    arenaHeight: number;
    /**
     * Width of arena measured in units
     */
    arenaWidth: number;
    /**
     * Default number of turns to show per second for an observer/UI
     */
    defaultTurnsPerSecond: number;
    /**
     * Type of game
     */
    gameType: string;
    /**
     * Gun cooling rate. The gun needs to cool down to a gun heat of zero before the gun is able
     * to fire
     */
    gunCoolingRate: number;
    /**
     * Flag specifying if the height of arena is fixed for this game type
     */
    isArenaHeightLocked: boolean;
    /**
     * Flag specifying if the width of arena is fixed for this game type
     */
    isArenaWidthLocked: boolean;
    /**
     * Flag specifying if the gun cooling rate is fixed for this game type
     */
    isGunCoolingRateLocked: boolean;
    /**
     * Flag specifying if the inactive turns is fixed for this game type
     */
    isMaxInactivityTurnsLocked: boolean;
    /**
     * Flag specifying if the maximum number of bots participating in battle is fixed for this
     * game type
     */
    isMaxNumberOfParticipantsLocked: boolean;
    /**
     * Flag specifying if the minimum number of bots participating in battle is fixed for this
     * game type
     */
    isMinNumberOfParticipantsLocked: boolean;
    /**
     * Flag specifying if the number-of-rounds is fixed for this game type
     */
    isNumberOfRoundsLocked: boolean;
    /**
     * Flag specifying if the ready timeout is fixed for this game type
     */
    isReadyTimeoutLocked: boolean;
    /**
     * Flag specifying if the turn timeout is fixed for this game type
     */
    isTurnTimeoutLocked: boolean;
    /**
     * Maximum number of inactive turns allowed, where a bot does not take any action before it
     * is zapped by the game
     */
    maxInactivityTurns: number;
    /**
     * Maximum number of bots participating in battle (is optional)
     */
    maxNumberOfParticipants?: number;
    /**
     * Minimum number of bots participating in battle
     */
    minNumberOfParticipants: number;
    /**
     * Number of rounds in battle
     */
    numberOfRounds: number;
    /**
     * Time limit in microseconds (µs) (where 1 microsecond equals 1/1,000,000 of a second) for
     * sending a 'ready' message after receiving a 'new battle' message.
     */
    readyTimeout: number;
    /**
     * Timeout duration in microseconds (µs) (where 1 microsecond equals 1/1,000,000 of a
     * second) for sending intent after receiving a 'tick' message.
     */
    turnTimeout: number;
    [property: string]: any;
}

export interface ObserverHandshakeSchemaYAMLObject {
    /**
     * Author name, e.g. John Doe (john_doe@somewhere.net)
     */
    author?: string;
    /**
     * Name of observer, e.g. Tron Neon 3D Window
     */
    name: string;
    /**
     * Secret used for access control with the server
     */
    secret?: string;
    /**
     * Unique session id that must match the session id received from the server handshake.
     */
    sessionId: string;
    /**
     * Observer version, e.g. 1.0
     */
    version: string;
    [property: string]: any;
}

export interface BulletFiredEventSchemaYAMLObject {
    /**
     * Bullet that was fired
     */
    bullet: any[] | boolean | number | number | null | BulletStateSchema | string;
    [property: string]: any;
}

export interface BulletHitBotEventSchemaYAMLObject {
    /**
     * Bullet that hit the bot
     */
    bullet: any[] | boolean | number | number | null | BulletStateSchema | string;
    /**
     * Damage inflicted by the bullet
     */
    damage: number;
    /**
     * Remaining energy level of the bot that got hit
     */
    energy: number;
    /**
     * id of the bot that got hit
     */
    victimId: number;
    [property: string]: any;
}

export interface BulletHitWallEventSchemaYAMLObject {
    /**
     * Bullet that has hit a wall
     */
    bullet: any[] | boolean | number | number | null | BulletStateSchema | string;
    [property: string]: any;
}

export interface BotDeathEventSchemaYAMLObject {
    /**
     * id of the bot that has died
     */
    victimId: number;
    [property: string]: any;
}

export interface BotHitBotEventSchemaYAMLObject {
    /**
     * id of the bot that hit another bot
     */
    botId: number;
    /**
     * Remaining energy level of the victim bot
     */
    energy: number;
    /**
     * Flag specifying, if the victim bot got rammed
     */
    rammed: boolean;
    /**
     * id of the victim bot that got hit
     */
    victimId: number;
    /**
     * X coordinate of victim bot
     */
    x: number;
    /**
     * Y coordinate of victim bot
     */
    y: number;
    [property: string]: any;
}

export interface BotHitWallEventSchemaYAMLObject {
    /**
     * id of the victim bot that hit the wall
     */
    victimId: number;
    [property: string]: any;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTickEventForObserverSchemaYAML(json: string): any[] | boolean | number | number | null | TickEventForObserverSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("TickEventForObserverSchemaYAMLObject"), ""));
    }

    public static tickEventForObserverSchemaYAMLToJson(value: any[] | boolean | number | number | null | TickEventForObserverSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("TickEventForObserverSchemaYAMLObject"), "")), null, 2);
    }

    public static toGameStartedEventForObserverSchemaYAML(json: string): any[] | boolean | number | number | null | GameStartedEventForObserverSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("GameStartedEventForObserverSchemaYAMLObject"), ""));
    }

    public static gameStartedEventForObserverSchemaYAMLToJson(value: any[] | boolean | number | number | null | GameStartedEventForObserverSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("GameStartedEventForObserverSchemaYAMLObject"), "")), null, 2);
    }

    public static toGameEndedEventForObserverSchemaYAML(json: string): any[] | boolean | number | number | null | GameEndedEventForObserverSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("GameEndedEventForObserverSchemaYAMLObject"), ""));
    }

    public static gameEndedEventForObserverSchemaYAMLToJson(value: any[] | boolean | number | number | null | GameEndedEventForObserverSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("GameEndedEventForObserverSchemaYAMLObject"), "")), null, 2);
    }

    public static toBotStateSchemaYAML(json: string): any[] | boolean | number | number | null | BotStateSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BotStateSchemaYAMLObject"), ""));
    }

    public static botStateSchemaYAMLToJson(value: any[] | boolean | number | number | null | BotStateSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BotStateSchemaYAMLObject"), "")), null, 2);
    }

    public static toBulletStateSchemaYAML(json: string): any[] | boolean | number | number | null | BulletStateSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BulletStateSchemaYAMLObject"), ""));
    }

    public static bulletStateSchemaYAMLToJson(value: any[] | boolean | number | number | null | BulletStateSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BulletStateSchemaYAMLObject"), "")), null, 2);
    }

    public static toBotInfoSchemaYAML(json: string): any[] | boolean | number | number | null | BotInfoSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BotInfoSchemaYAMLObject"), ""));
    }

    public static botInfoSchemaYAMLToJson(value: any[] | boolean | number | number | null | BotInfoSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BotInfoSchemaYAMLObject"), "")), null, 2);
    }

    public static toGameSetupSchemaYAML(json: string): any[] | boolean | number | number | null | GameSetupSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("GameSetupSchemaYAMLObject"), ""));
    }

    public static gameSetupSchemaYAMLToJson(value: any[] | boolean | number | number | null | GameSetupSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("GameSetupSchemaYAMLObject"), "")), null, 2);
    }

    public static toObserverHandshakeSchemaYAML(json: string): any[] | boolean | number | number | null | ObserverHandshakeSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("ObserverHandshakeSchemaYAMLObject"), ""));
    }

    public static observerHandshakeSchemaYAMLToJson(value: any[] | boolean | number | number | null | ObserverHandshakeSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("ObserverHandshakeSchemaYAMLObject"), "")), null, 2);
    }

    public static toBulletFiredEventSchemaYAML(json: string): any[] | boolean | number | number | null | BulletFiredEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BulletFiredEventSchemaYAMLObject"), ""));
    }

    public static bulletFiredEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BulletFiredEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BulletFiredEventSchemaYAMLObject"), "")), null, 2);
    }

    public static toBulletHitBotEventSchemaYAML(json: string): any[] | boolean | number | number | null | BulletHitBotEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BulletHitBotEventSchemaYAMLObject"), ""));
    }

    public static bulletHitBotEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BulletHitBotEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BulletHitBotEventSchemaYAMLObject"), "")), null, 2);
    }

    public static toBulletHitWallEventSchemaYAML(json: string): any[] | boolean | number | number | null | BulletHitWallEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BulletHitWallEventSchemaYAMLObject"), ""));
    }

    public static bulletHitWallEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BulletHitWallEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BulletHitWallEventSchemaYAMLObject"), "")), null, 2);
    }

    public static toBotDeathEventSchemaYAML(json: string): any[] | boolean | number | number | null | BotDeathEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BotDeathEventSchemaYAMLObject"), ""));
    }

    public static botDeathEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BotDeathEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BotDeathEventSchemaYAMLObject"), "")), null, 2);
    }

    public static toBotHitBotEventSchemaYAML(json: string): any[] | boolean | number | number | null | BotHitBotEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BotHitBotEventSchemaYAMLObject"), ""));
    }

    public static botHitBotEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BotHitBotEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BotHitBotEventSchemaYAMLObject"), "")), null, 2);
    }

    public static toBotHitWallEventSchemaYAML(json: string): any[] | boolean | number | number | null | BotHitWallEventSchemaYAMLObject | string {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("BotHitWallEventSchemaYAMLObject"), ""));
    }

    public static botHitWallEventSchemaYAMLToJson(value: any[] | boolean | number | number | null | BotHitWallEventSchemaYAMLObject | string): string {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("BotHitWallEventSchemaYAMLObject"), "")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "TickEventForObserverSchemaYAMLObject": o([
        { json: "botStates", js: "botStates", typ: a(u(a("any"), true, 3.14, 0, null, r("BotStateObject"), "")) },
        { json: "bulletStates", js: "bulletStates", typ: a(u(a("any"), true, 3.14, 0, null, r("BulletStateSchema"), "")) },
        { json: "events", js: "events", typ: a(u(a("any"), true, 3.14, 0, null, r("EventObject"), "")) },
        { json: "roundNumber", js: "roundNumber", typ: 0 },
    ], "any"),
    "BotStateObject": o([
        { json: "debugGraphics", js: "debugGraphics", typ: u(undefined, "") },
        { json: "id", js: "id", typ: 0 },
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "stdErr", js: "stdErr", typ: u(undefined, "") },
        { json: "stdOut", js: "stdOut", typ: u(undefined, "") },
    ], "any"),
    "BulletStateSchema": o([
        { json: "bulletId", js: "bulletId", typ: 0 },
        { json: "color", js: "color", typ: u(undefined, "") },
        { json: "direction", js: "direction", typ: 3.14 },
        { json: "ownerId", js: "ownerId", typ: 0 },
        { json: "power", js: "power", typ: 3.14 },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], "any"),
    "EventObject": o([
        { json: "turnNumber", js: "turnNumber", typ: 0 },
    ], "any"),
    "GameStartedEventForObserverSchemaYAMLObject": o([
        { json: "gameSetup", js: "gameSetup", typ: u(a("any"), true, 3.14, 0, null, r("GameSetupSchema"), "") },
        { json: "participants", js: "participants", typ: a(u(a("any"), true, 3.14, 0, null, r("ParticipantObject"), "")) },
    ], "any"),
    "GameSetupSchema": o([
        { json: "arenaHeight", js: "arenaHeight", typ: 0 },
        { json: "arenaWidth", js: "arenaWidth", typ: 0 },
        { json: "defaultTurnsPerSecond", js: "defaultTurnsPerSecond", typ: 0 },
        { json: "gameType", js: "gameType", typ: "" },
        { json: "gunCoolingRate", js: "gunCoolingRate", typ: 3.14 },
        { json: "isArenaHeightLocked", js: "isArenaHeightLocked", typ: true },
        { json: "isArenaWidthLocked", js: "isArenaWidthLocked", typ: true },
        { json: "isGunCoolingRateLocked", js: "isGunCoolingRateLocked", typ: true },
        { json: "isMaxInactivityTurnsLocked", js: "isMaxInactivityTurnsLocked", typ: true },
        { json: "isMaxNumberOfParticipantsLocked", js: "isMaxNumberOfParticipantsLocked", typ: true },
        { json: "isMinNumberOfParticipantsLocked", js: "isMinNumberOfParticipantsLocked", typ: true },
        { json: "isNumberOfRoundsLocked", js: "isNumberOfRoundsLocked", typ: true },
        { json: "isReadyTimeoutLocked", js: "isReadyTimeoutLocked", typ: true },
        { json: "isTurnTimeoutLocked", js: "isTurnTimeoutLocked", typ: true },
        { json: "maxInactivityTurns", js: "maxInactivityTurns", typ: 0 },
        { json: "maxNumberOfParticipants", js: "maxNumberOfParticipants", typ: u(undefined, 0) },
        { json: "minNumberOfParticipants", js: "minNumberOfParticipants", typ: 0 },
        { json: "numberOfRounds", js: "numberOfRounds", typ: 0 },
        { json: "readyTimeout", js: "readyTimeout", typ: 0 },
        { json: "turnTimeout", js: "turnTimeout", typ: 0 },
    ], "any"),
    "ParticipantObject": o([
        { json: "authors", js: "authors", typ: a("") },
        { json: "countryCodes", js: "countryCodes", typ: u(undefined, a("")) },
        { json: "description", js: "description", typ: u(undefined, "") },
        { json: "gameTypes", js: "gameTypes", typ: u(undefined, a("")) },
        { json: "homepage", js: "homepage", typ: u(undefined, "") },
        { json: "id", js: "id", typ: 0 },
        { json: "initialPosition", js: "initialPosition", typ: u(undefined, u(a("any"), true, 3.14, 0, null, r("InitialPositionSchema"), "")) },
        { json: "isDroid", js: "isDroid", typ: u(undefined, true) },
        { json: "name", js: "name", typ: "" },
        { json: "platform", js: "platform", typ: u(undefined, "") },
        { json: "programmingLang", js: "programmingLang", typ: u(undefined, "") },
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "teamId", js: "teamId", typ: u(undefined, 0) },
        { json: "teamName", js: "teamName", typ: u(undefined, "") },
        { json: "teamVersion", js: "teamVersion", typ: u(undefined, "") },
        { json: "version", js: "version", typ: "" },
    ], "any"),
    "InitialPositionSchema": o([
        { json: "direction", js: "direction", typ: u(undefined, 3.14) },
        { json: "x", js: "x", typ: u(undefined, 3.14) },
        { json: "y", js: "y", typ: u(undefined, 3.14) },
    ], "any"),
    "GameEndedEventForObserverSchemaYAMLObject": o([
        { json: "numberOfRounds", js: "numberOfRounds", typ: 0 },
        { json: "results", js: "results", typ: a(u(a("any"), true, 3.14, 0, null, r("ResultObject"), "")) },
    ], "any"),
    "ResultObject": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "version", js: "version", typ: "" },
    ], "any"),
    "BotStateSchemaYAMLObject": o([
        { json: "bodyColor", js: "bodyColor", typ: u(undefined, "") },
        { json: "bulletColor", js: "bulletColor", typ: u(undefined, "") },
        { json: "direction", js: "direction", typ: 3.14 },
        { json: "enemyCount", js: "enemyCount", typ: 0 },
        { json: "energy", js: "energy", typ: 3.14 },
        { json: "gunColor", js: "gunColor", typ: u(undefined, "") },
        { json: "gunDirection", js: "gunDirection", typ: 3.14 },
        { json: "gunHeat", js: "gunHeat", typ: 3.14 },
        { json: "gunTurnRate", js: "gunTurnRate", typ: 3.14 },
        { json: "isDebuggingEnabled", js: "isDebuggingEnabled", typ: u(undefined, true) },
        { json: "isDroid", js: "isDroid", typ: u(undefined, true) },
        { json: "radarColor", js: "radarColor", typ: u(undefined, "") },
        { json: "radarDirection", js: "radarDirection", typ: 3.14 },
        { json: "radarSweep", js: "radarSweep", typ: 3.14 },
        { json: "radarTurnRate", js: "radarTurnRate", typ: 3.14 },
        { json: "scanColor", js: "scanColor", typ: u(undefined, "") },
        { json: "speed", js: "speed", typ: 3.14 },
        { json: "tracksColor", js: "tracksColor", typ: u(undefined, "") },
        { json: "turnRate", js: "turnRate", typ: 3.14 },
        { json: "turretColor", js: "turretColor", typ: u(undefined, "") },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], "any"),
    "BulletStateSchemaYAMLObject": o([
        { json: "bulletId", js: "bulletId", typ: 0 },
        { json: "color", js: "color", typ: u(undefined, "") },
        { json: "direction", js: "direction", typ: 3.14 },
        { json: "ownerId", js: "ownerId", typ: 0 },
        { json: "power", js: "power", typ: 3.14 },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], "any"),
    "BotInfoSchemaYAMLObject": o([
        { json: "host", js: "host", typ: "" },
        { json: "port", js: "port", typ: 0 },
    ], "any"),
    "GameSetupSchemaYAMLObject": o([
        { json: "arenaHeight", js: "arenaHeight", typ: 0 },
        { json: "arenaWidth", js: "arenaWidth", typ: 0 },
        { json: "defaultTurnsPerSecond", js: "defaultTurnsPerSecond", typ: 0 },
        { json: "gameType", js: "gameType", typ: "" },
        { json: "gunCoolingRate", js: "gunCoolingRate", typ: 3.14 },
        { json: "isArenaHeightLocked", js: "isArenaHeightLocked", typ: true },
        { json: "isArenaWidthLocked", js: "isArenaWidthLocked", typ: true },
        { json: "isGunCoolingRateLocked", js: "isGunCoolingRateLocked", typ: true },
        { json: "isMaxInactivityTurnsLocked", js: "isMaxInactivityTurnsLocked", typ: true },
        { json: "isMaxNumberOfParticipantsLocked", js: "isMaxNumberOfParticipantsLocked", typ: true },
        { json: "isMinNumberOfParticipantsLocked", js: "isMinNumberOfParticipantsLocked", typ: true },
        { json: "isNumberOfRoundsLocked", js: "isNumberOfRoundsLocked", typ: true },
        { json: "isReadyTimeoutLocked", js: "isReadyTimeoutLocked", typ: true },
        { json: "isTurnTimeoutLocked", js: "isTurnTimeoutLocked", typ: true },
        { json: "maxInactivityTurns", js: "maxInactivityTurns", typ: 0 },
        { json: "maxNumberOfParticipants", js: "maxNumberOfParticipants", typ: u(undefined, 0) },
        { json: "minNumberOfParticipants", js: "minNumberOfParticipants", typ: 0 },
        { json: "numberOfRounds", js: "numberOfRounds", typ: 0 },
        { json: "readyTimeout", js: "readyTimeout", typ: 0 },
        { json: "turnTimeout", js: "turnTimeout", typ: 0 },
    ], "any"),
    "ObserverHandshakeSchemaYAMLObject": o([
        { json: "author", js: "author", typ: u(undefined, "") },
        { json: "name", js: "name", typ: "" },
        { json: "secret", js: "secret", typ: u(undefined, "") },
        { json: "sessionId", js: "sessionId", typ: "" },
        { json: "version", js: "version", typ: "" },
    ], "any"),
    "BulletFiredEventSchemaYAMLObject": o([
        { json: "bullet", js: "bullet", typ: u(a("any"), true, 3.14, 0, null, r("BulletStateSchema"), "") },
    ], "any"),
    "BulletHitBotEventSchemaYAMLObject": o([
        { json: "bullet", js: "bullet", typ: u(a("any"), true, 3.14, 0, null, r("BulletStateSchema"), "") },
        { json: "damage", js: "damage", typ: 3.14 },
        { json: "energy", js: "energy", typ: 3.14 },
        { json: "victimId", js: "victimId", typ: 0 },
    ], "any"),
    "BulletHitWallEventSchemaYAMLObject": o([
        { json: "bullet", js: "bullet", typ: u(a("any"), true, 3.14, 0, null, r("BulletStateSchema"), "") },
    ], "any"),
    "BotDeathEventSchemaYAMLObject": o([
        { json: "victimId", js: "victimId", typ: 0 },
    ], "any"),
    "BotHitBotEventSchemaYAMLObject": o([
        { json: "botId", js: "botId", typ: 0 },
        { json: "energy", js: "energy", typ: 3.14 },
        { json: "rammed", js: "rammed", typ: true },
        { json: "victimId", js: "victimId", typ: 0 },
        { json: "x", js: "x", typ: 3.14 },
        { json: "y", js: "y", typ: 3.14 },
    ], "any"),
    "BotHitWallEventSchemaYAMLObject": o([
        { json: "victimId", js: "victimId", typ: 0 },
    ], "any"),
};


// Friendly type aliases for Tank Royale
export type TickEventForObserver = TickEventForObserverSchemaYAMLObject
export type GameStartedEventForObserver = GameStartedEventForObserverSchemaYAMLObject
export type GameEndedEventForObserver = GameEndedEventForObserverSchemaYAMLObject
export type BotState = BotStateSchemaYAMLObject
export type BulletState = BulletStateSchemaYAMLObject
export type BotInfo = BotInfoSchemaYAMLObject
export type GameSetup = GameSetupSchemaYAMLObject
export type ObserverHandshake = ObserverHandshakeSchemaYAMLObject
export type BulletFiredEvent = BulletFiredEventSchemaYAMLObject
export type BulletHitBotEvent = BulletHitBotEventSchemaYAMLObject
export type BulletHitWallEvent = BulletHitWallEventSchemaYAMLObject
export type BotDeathEvent = BotDeathEventSchemaYAMLObject
export type BotHitBotEvent = BotHitBotEventSchemaYAMLObject
export type BotHitWallEvent = BotHitWallEventSchemaYAMLObject

// Custom type utilities for Tank Royale
export type MessageType = 
  | 'TickEventForObserver'
  | 'GameStartedEventForObserver'
  | 'GameEndedEventForObserver'
  | 'BulletFiredEvent'
  | 'BulletHitBotEvent'
  | 'BulletHitWallEvent'
  | 'BotDeathEvent'
  | 'BotHitBotEvent'
  | 'BotHitWallEvent'
  | 'ObserverHandshake'

export type EventHandler<T> = (event: T) => void

export interface BattleEventMap {
  tick: TickEventForObserver
  gameStarted: GameStartedEventForObserver
  gameEnded: GameEndedEventForObserver
  bulletFired: BulletFiredEvent
  bulletHitBot: BulletHitBotEvent
  bulletHitWall: BulletHitWallEvent
  botDeath: BotDeathEvent
  botHitBot: BotHitBotEvent
  botHitWall: BotHitWallEvent
}

// WebSocket message wrapper
export interface WebSocketMessage {
  type: MessageType
  data?: any
}

// Connection state
export interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  error?: string
  serverUrl?: string
}

// Audio event types
export interface AudioEvent {
  type: 'explosion' | 'gunshot' | 'hit' | 'death'
  volume?: number
  position?: { x: number; y: number }
}
