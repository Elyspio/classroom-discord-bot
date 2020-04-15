import {GuildMember} from "discord.js";

export interface Member {
    discord: GuildMember,
    cpe: CpeData
}

export interface CpeData {
    firstname?: string,
    lastname?: string
    group?: string
}