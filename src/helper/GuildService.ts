import {roles} from "../config";
import {DiscordMember} from "../types";

export namespace Service {
	class User {

	}

	export class Permission {
		public static isAdmin = (member: DiscordMember) => {
			return member.hasPermission("ADMINISTRATOR");
		}

		public static isStudent = (member: DiscordMember) => {
			return member.roles.cache.array().find(role => role.name === roles.student.name) !== undefined
		}
	}
}
