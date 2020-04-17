import {DMChannel, GuildMember, Message} from "discord.js";
import {CpeData, Level, Member} from "./types";
import {messages, sheetName} from "./config";
import {DiscordMember} from "./main";
import {Google} from "./helper/GoogleHelper";

export class Interactor {
	private readonly member: GuildMember;
	private readonly data: CpeData
	private dmChannel?: DMChannel;
	private canReAsk = true;

	public constructor(member: DiscordMember) {
		this.member = member as GuildMember;
		this.data = {
			lastname: undefined,
			group: undefined,
			firstname: undefined
		}
	}

	public async handle(): Promise<Member> {

		this.dmChannel = await this.member.user.createDM()
		this.dmChannel.client.on("message", (message) => this.handleResponse(message))
		await this.askMessage(`${messages.init}\n${messages.askLastname}`)
		return new Promise(resolve => {

			const timeout = setInterval(async () => {
				if (this.data.lastname !== undefined) {
					const {lastname} = this.data;

					const user = await Google.Sheet.find(sheetName, lastname)

					if (user === null && this.canReAsk) {
						await this.dmChannel.send("Désolé, je n'ai pas réussi à te retrouver dans le Google Sheet...\n" +
							"Peux-tu me donner ton nom encore une fois s'il te plait ?")
						this.data.lastname = undefined;
						this.canReAsk = false;
					} else {
						this.data.group = (await Google.Sheet.get(sheetName, user.row, user.offset(0, -1).col)).value;
						this.data.firstname = (await Google.Sheet.get(sheetName, user.row, user.offset(0, 1).col)).value;
						const level = (await Google.Sheet.get(sheetName, user.row, user.offset(0, -2).col)).value;

						console.log("data", this.data, level)
						clearInterval(timeout);
						await this.askMessage(messages.askBackToServer)
						resolve({
							discord: this.member,
							cpe: {
								...this.data,
								level: level.trim() === "Groupe 2 (autres origines)" ? Level.NEW : Level.ADVANCED
							}
						})
					}
				}
			}, 500)
		})
	}

	private async handleResponse(message: Message) {
		if (this.isMessageReliable(message)) {
			if (this.data.lastname == undefined) {
				this.data.lastname = message.content;
			} else {
			}
			this.canReAsk = true;
		}
	}

	private isMessageReliable(message: Message) {
		return message.channel.id === this.dmChannel?.id && message.author.id === this.member.user.id
	}

	private async askMessage(askLastname: string) {
		return this.dmChannel?.send(askLastname)
	}
}
