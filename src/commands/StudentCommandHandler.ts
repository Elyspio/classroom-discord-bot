import {CommandHandler} from "./CommandHandler";
import {messages} from "../config";
import {Message, MessageEmbed} from "discord.js";
import {Service} from "../helper/GuildService";

export class StudentCommandHandler extends CommandHandler {

	public constructor() {
		super();
		super.addCommands({
			// "/help": this.askHelp
		});

	}

	public checkRights(message: Message): boolean {
		return Service.Permission.isStudent(this.member);
	}

	private askHelp = async (message: Message): Promise<void> => {

		// do something with queue
		const embed = new MessageEmbed()
			.setColor('#51ff7a')
			.setTitle(messages.helpSummaryTitle)
			.setDescription(`Votre place dans la file : **${4}**`)
		await message.channel.send(embed)
	}
}
