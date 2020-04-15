import {Client, GuildMember, PartialGuildMember} from "discord.js";
import {allowedServers} from "./config";
import {Interactor} from "./Interactor";
import {JoinManager} from "./Manager/JoinManager";
import {StudentCommandHandler} from "./commands/StudentCommandHandler";
import {TeacherCommandHandler} from "./commands/TeacherCommandHandler";

const client = new Client();


export type DiscordMember = GuildMember | PartialGuildMember;
client.once('ready', () => {
    const teacherCommands = new TeacherCommandHandler()
    const studentCommands = new StudentCommandHandler()
    console.log('Ready!');
    client.on("guildMemberAdd", async (member: DiscordMember) => {

        if (allowedServers.some(id => id === member.guild.id)) {
            console.log(`Member ${member.user.username} add in Guild: ${member.guild.name} at ${new Date()}`);
            const manager = await (await JoinManager.get(member.guild)).init();
            const interactor = new Interactor(member);
            await manager.addUser(await interactor.handle())
        }
    })

    client.on("message", async message => {

        if(!message.author.bot) {

            try {
                await Promise.all([
                    teacherCommands.handle(message),
                    studentCommands.handle(message)
                ])
            }
            catch(e) {
                console.error("Error in command handler", e, JSON.stringify(e));
            }
        }
    });

});

client.login("NjkyMTE1OTE4MjI2MTk0NDg0.Xnp1Pg.NZ8GSt6Eu_v-yQHr103fBY_XBg0").then(() => {
    console.log("Bot is logged");
});