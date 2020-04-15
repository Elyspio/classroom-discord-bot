import {PermissionString} from "discord.js";

export const allowedServers = [
    "692081557527068733",
    "693907372720259134",
    "693907318743629926"
]

export const studentRoleConfig = {
    color: "AQUA",
    name: "Élèves",
}

export const classroomConfig = {
    name: "Salle de classe"
}
export const helpChannelConfig = {
    name: "Demander de l'aide"
}

export const permissions: { voice: PermissionString[], text: PermissionString[], category: PermissionString[] } = {
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