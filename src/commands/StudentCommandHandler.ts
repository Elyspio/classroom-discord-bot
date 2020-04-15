import {CommandHandler} from "./CommandHandler";
import {messages, studentRoleConfig} from "../config";
import {Message, MessageEmbed} from "discord.js";
import {ChannelHelper} from "../helper/ChannelHelper";

export class StudentCommandHandler extends CommandHandler {

    public constructor() {
        super();
        super.addCommands({
            // "/help": this.askHelp
        });

    }

    public checkRights(message: Message): boolean {
        console.log("check", message.member.roles.cache);
        return message.member.roles.cache.array().find(role => role.name === ChannelHelper.vocalToText(studentRoleConfig.name)) !== undefined;
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