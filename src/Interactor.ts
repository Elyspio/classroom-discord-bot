import {
	Collection,
	DMChannel,
	GuildMember,
	Message,
	MessageReaction,
	User
} from "discord.js";
import {CpeData, DiscordMember, Level, Member} from "./types";
import {emoticons, messages, sheetName} from "./config";
import {Google} from "./helper/GoogleHelper";
import util from "util"
import Cell = Google.Cell;

export class Interactor {
	private readonly member: GuildMember;
	private readonly data: CpeData
	private dmChannel?: DMChannel;
	private canReAsk = true;
	private resolver;
	private messageListener;


	public constructor(member: DiscordMember) {
		this.member = member as GuildMember;
		this.data = {
			lastname: undefined,
			group: undefined,
			firstname: undefined
		}
	}

	public async handle(): Promise<Member> {

		this.data.lastname = undefined;
		this.data.firstname = undefined;
		this.data.group = undefined;
		this.data.level = undefined;

		this.dmChannel = await this.member.user.createDM()
		this.messageListener = (message) => this.handleResponse(message);
		this.dmChannel.client.on("message", this.messageListener)
		await this.sendMessage(`${messages.init}\n${messages.askLastname}`)
		return new Promise(resolve => {
			this.resolver = resolve;
		})
	}


	private async update() {
		const students: {
			fromLastName?: Cell[],
			fromFirstName?: Cell[]
		} = {};

		let output: Member;

		if (this.data.lastname) {
			students.fromLastName = await Google.Sheet.find(sheetName, this.data.lastname);
			if (students.fromLastName.length === 0) {
				await this.dmChannel.send("Désolé, je n'ai pas réussi à te retrouver dans le Google Sheet...\n" +
					"Peux-tu me donner ton nom encore une fois s'il te plait ?")
				this.data.lastname = undefined;
			}
			if (students.fromLastName.length === 1) {
				const cell = students.fromLastName[0];
				const firstname = (await Google.Sheet.get(sheetName, cell.row, cell.offset(0, 1).col)).value;
				const group = (await Google.Sheet.get(sheetName, cell.row, cell.offset(0, -1).col)).value;
				const level = (await Google.Sheet.get(sheetName, cell.row, cell.offset(0, -2).col)).value.trim() === "Groupe 2 (autres origines)" ? Level.NEW : Level.ADVANCED;

				await this.sendMessage(util.format(messages.askBackToServer, firstname));

				output = {
					discord: this.member,
					cpe: {
						lastname: this.data.lastname,
						firstname,
						group,
						level: level
					}
				}
				this.resolver(output)
				this.dmChannel.client.off("message", this.messageListener);
			}
			if (students.fromLastName.length > 1) {

				if (this.data.firstname === undefined) {
					const cells = await Promise.all(students.fromLastName.map(cell => cell.offset(0, 1)).map(cell => Google.Sheet.get(sheetName, cell.row, cell.col)))
					await this.sendMessage("Désolé mais plusieurs éleves ont le même nom de famille que toi.\nPeux-tu réagir avec l'emote " + emoticons.accept + " sur ton nom ou avec 🚫 sinon");
					for (const name of cells.map(cell => cell.value)) {
						const message = await this.sendMessage(name)
						await Promise.all([message.react(emoticons.accept),
								await message.react(emoticons.nop)
							]
						)

						const x: Collection<string, MessageReaction> = await message.awaitReactions((reaction, user: User) => {
							return !user.bot
						}, {max: 1, time: 600000, errors: ["time"]});
						this.data.firstname = x.first().emoji.name === emoticons.accept ? x.first().message.content : "";
					}
					const cell = (await Google.Sheet.find(sheetName, this.data.lastname, {valueInRow: [this.data.firstname]}))[0]


					output = {
						discord: this.member,
						cpe: {
							firstname: this.data.firstname,
							lastname: this.data.lastname,
							group: (await Google.Sheet.get(sheetName, cell.row, cell.offset(0, -1).col)).value,
							level: (await Google.Sheet.get(sheetName, cell.row, cell.offset(0, -2).col)).value.trim() === "Groupe 2 (autres origines)" ? Level.NEW : Level.ADVANCED
						}
					}
					await this.sendMessage(util.format(messages.askBackToServer, this.data.firstname));

					this.resolver(output);
					this.dmChannel.client.off("message", this.messageListener);

				}


			}
		}
	}

	private async handleResponse(message: Message) {
		if (this.isMessageReliable(message)) {
			if (this.data.lastname == undefined) {
				this.data.lastname = message.content;
				await this.update();
			} else {
				this.data.firstname = message.content
				await this.update();
			}
			this.canReAsk = true;
		}
	}

	private isMessageReliable(message: Message) {
		return message.channel.id === this.dmChannel?.id && message.author.id === this.member.user.id && !message.author.bot
	}

	private async sendMessage(askLastname: string) {
		return this.dmChannel?.send(askLastname)
	}
}
