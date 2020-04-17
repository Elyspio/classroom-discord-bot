import {
	Guild,
	Message,
	MessageEmbed,
	MessageReaction,
	PartialUser,
	TextChannel,
	User
} from "discord.js";
import {emoticons, helpChannelConfig, messages} from "../config";

export class HelpManager {
	private static instances: Map<string, HelpManager>
	private guild: Guild;

	private summary: Message
	private helpChannel: TextChannel

	private constructor(guild: Guild) {
		this.guild = guild;
	}

	public static async get(guild: Guild) {
		if (!HelpManager.instances) {
			HelpManager.instances = new Map();
		}
		if (!HelpManager.instances.has(guild.id)) {
			HelpManager.instances.set(guild.id, await (new HelpManager(guild).init()))
		}

		return HelpManager.instances.get(guild.id);

	}

	private async init(): Promise<HelpManager> {
		this.helpChannel = this.guild.channels.cache.array().find(channel => channel.name === helpChannelConfig.name) as TextChannel;
		if (this.helpChannel === undefined) {
			this.helpChannel = await this.guild.channels.create(helpChannelConfig.name);
		}

		this.summary = this.helpChannel.messages.cache[this.helpChannel.messages.cache.size - 1];
		if (this.summary === undefined) {
			this.summary = await this.helpChannel.send(new MessageEmbed({title: messages.helpSummaryTitle}))

			await Promise.all([
				this.summary.react(emoticons.needHelp),
				this.summary.react(emoticons.accept),
			])
		}

		this.summary.client.on("messageReactionAdd", (reaction: MessageReaction, member: User | PartialUser) => {
			if (reaction.message.id === this.summary.id) {

			}
		})

		return this;
	}


}
