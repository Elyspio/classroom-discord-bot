import {Level} from "../types";
import {PermissionString, RoleData} from "discord.js";

export const sheetName = "Feuille 1";

export const allowedServers = [
	"692081557527068733",
	"693907372720259134",
	"693907318743629926",
	"692059829069676666",
	"700712829526999040",
	"700793379050750012"
]

export type MapAs<Keys extends string, T> = {
	[K in Keys]: T;
}


export const roles: MapAs<"student" | "prof" | "grp1" | "grp2", RoleData> = {
	student: {
		color: "AQUA",
		name: "Élèves",
	},
	prof: {
		color: "RED",
		name: "Prof",
		permissions: "ADMINISTRATOR",
		mentionable: true
	},
	grp1: {
		color: "ORANGE",
		name: Level.ADVANCED,

	},
	grp2: {
		color: "BLUE",
		name: Level.NEW,
	},
}

export const classroomConfig = {
	name: "Salle de classe"
}
export const helpChannelConfig = {
	name: "Demander de l'aide"
}

export const permissions: MapAs<"voice" | "text" | "category", PermissionString[]> = {
	voice: [
		"USE_VAD",
		"SPEAK",
		"VIEW_CHANNEL",
		"CONNECT",
		"STREAM",
	],
	text: [
		"SEND_MESSAGES",
		"READ_MESSAGE_HISTORY",
		"ATTACH_FILES",
		"ADD_REACTIONS",
		"VIEW_CHANNEL",
	],
	category: ["VIEW_CHANNEL"]
}


export const emoticons = {
	needHelp: "✋",
	accept: "✅"
}

export const messages = {
	init: "Salut, je suis le bot qui gère le discord du module",
	askFirstname: "Quel est ton prénom ?",
	askLastname: "Quel est ton nom de famille ?",
	askGroupName: "Quel est le numéro de ton groupe ?",
	askBackToServer: "Merci d'avoir répondu à mes questions tu peux revenir sur le serveur maintenant.",
	helpSummaryTitle: "Liste des personnes demandant de l'aide"
}
