import {Guild, GuildMember, Message} from "discord.js";

export interface ICommandHandler {
	handle: (message: Message) => Promise<void>
	checkRights: (message: Message) => boolean
}

export abstract class CommandHandler implements ICommandHandler {
	protected message: Message;
	protected guild?: Guild;
	protected member?: GuildMember;
	protected commands: Map<string, Function>

	protected constructor() {
		this.commands = new Map<string, Function>();
	}

	abstract checkRights(message: Message): boolean;

	public async handle(message: Message): Promise<void> {
		console.log(`handle message: ${message.content} from ${message.author.username}`);

		if (this.commands.has(message.content) && this.checkRights(message)) {
			this.commands.get(message.content).call(this, message);
		}
	}

	protected addCommands(commands: { [key: string]: Function }) {
		for (let key in commands) {
			this.commands.set(key, commands[key]);
			console.log(`Ajout de la commande '${key}'`)
		}
	}

}


