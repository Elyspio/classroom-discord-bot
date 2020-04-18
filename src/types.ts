import {GuildMember, PartialGuildMember} from "discord.js";

export interface Member {
	discord: GuildMember,
	cpe: CpeData
}

export interface CpeData {
	firstname?: string,
	lastname?: string
	group?: string,
	level?: Level
}

export enum Level {
	NEW = "Groupe 2",
	ADVANCED = "Groupe 1"
}

export type DiscordMember = GuildMember | PartialGuildMember;
