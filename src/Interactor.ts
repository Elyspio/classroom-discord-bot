import {DMChannel, GuildMember, Message} from "discord.js";
import {CpeData, Member} from "./types";
import {messages} from "./config";
import {DiscordMember} from "./main";

export class Interactor {
    private readonly member: GuildMember;
    private readonly data: CpeData
    private dmChannel?: DMChannel;

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
        await this.askMessage(`${messages.init}\n${messages.askFirstname}`)
        return new Promise(resolve => {
            const timeout = () => setTimeout(() => {
                if (this.data.group === undefined) {
                    timeout();
                } else {
                    resolve({
                        discord: this.member,
                        cpe: this.data
                    })
                }
            }, 100)
            timeout();
        })
    }

    private async handleResponse(message: Message) {
        if (this.isMessageReliable(message)) {
            if (this.data.firstname == undefined) {
                this.data.firstname = message.content;
                await this.askMessage(messages.askLastname);
            } else {
                if (this.data.lastname == undefined) {
                    this.data.lastname = message.content;
                    await this.askMessage(messages.askGroupName);
                } else {
                    if (this.data.group == undefined) {
                        this.data.group = "groupe-" + message.content;
                        await this.askMessage(messages.askBackToServer)
                    }
                }
            }
        }
    }

    private isMessageReliable(message: Message) {
        return  message.channel.id === this.dmChannel?.id && message.author.id === this.member.user.id
    }

    private async askMessage(askLastname: string) {
        return this.dmChannel?.send(askLastname)
    }
}