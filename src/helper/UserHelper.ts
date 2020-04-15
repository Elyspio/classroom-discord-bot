import {DiscordMember} from "../main";
import {Role} from "discord.js";
import {studentRoleConfig} from "../config";

export namespace Helper {
    class User {

    }
    class Permisson {
        public static isAdmin = (member: DiscordMember) => {
            return member.hasPermission("ADMINISTRATOR");
        }

        public static isStudent = (member: DiscordMember) => {
            return member.roles.cache.array().find(role => role.name === studentRoleConfig.name) !== undefined
        }
    }
}
