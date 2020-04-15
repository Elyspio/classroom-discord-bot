import {CommandHandler} from "./CommandHandler";
import {JoinManager} from "../Manager/JoinManager";
import {Interactor} from "../Interactor";
import {Message, TextChannel} from "discord.js";
import {helpChannelConfig} from "../config";
import {HelpManager} from "../Manager/HelpManager";

export class TeacherCommandHandler extends CommandHandler {


    public constructor() {
        super();
        super.addCommands({
            // "/clear": this.clear,
            "/resign": this.reSign,
            // "/openHelpCenter": this.openHelpCenter
        });
    }
    checkRights(): boolean {
        return true;
        return this.member?.hasPermission("ADMINISTRATOR") || false;
    }

    private async clear(message: Message) {
        if(message.guild) {
            await Promise.all(message.guild.channels.cache.map(channel => channel.delete()));
            await Promise.all(message.guild.roles.cache.map(channel => channel.delete()));
            await message.guild.channels.create("général", {type: "text"});
        }
    }

    private async reSign([message] : [Message]) {
        console.log("resign", message[0], message.channel);
        const guild = (message.channel as TextChannel).guild;
        if(guild) {
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
        if(guild) {
            const manager = await HelpManager.get(guild)

        }
    }
}