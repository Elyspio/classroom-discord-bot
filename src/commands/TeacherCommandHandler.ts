import {CommandHandler} from "./CommandHandler";
import {JoinManager} from "../Manager/JoinManager";
import {Interactor} from "../Interactor";
import {Message, TextChannel} from "discord.js";
import {HelpManager} from "../Manager/HelpManager";
import {Service} from "../helper/GuildService";

export class TeacherCommandHandler extends CommandHandler {


	public constructor() {
		super();
		super.addCommands({
			"/clear": this.clear,
			"/resign": this.reSign,
		});
	}

	checkRights(message: Message): boolean {
		return Service.Permission.isAdmin(message.member);
	}

	private async clear(message: Message) {
		if (message.guild) {
			const guild = await message.guild.fetch();

			await Promise.all([
				...guild.channels.cache.filter(c => c.id !== message.channel.id).map(channel => channel.delete()),
				...guild.roles.cache.filter(role => role.id !== guild.roles.everyone.id && role.name !== role.client.user.username).map(role => role.delete()),

			] as Promise<any>[])
			await message.channel.bulkDelete(await message.channel.messages.fetch())
			console.log(`Cleared by ${message.author.username}`);
		}
	}

	private async reSign(message: Message) {
		console.log("resign", message.channel);
		const guild = (message.channel as TextChannel).guild;
		if (guild) {
			const manager = await (await JoinManager.get(guild)).init();
			const needResign = guild.members.cache.filter(member => member.roles.cache.size === 1);
			console.log("Resign for \n\t- ", needResign.map(member => member.displayName).join("\n\t- "));
			await Promise.all(needResign.map(async member => {
				const interactor = new Interactor(member);
				return manager.addUser(await interactor.handle())
			}))
		}
	}

	private async openHelpCenter(message: Message) {
		const guild = (message.channel as TextChannel).guild;
		if (guild) {
			const manager = await HelpManager.get(guild)

		}
	}
}
