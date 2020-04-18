import {Client} from "discord.js";
import {allowedServers} from "./config";
import {Interactor} from "./Interactor";
import {JoinManager} from "./Manager/JoinManager";
import {StudentCommandHandler} from "./commands/StudentCommandHandler";
import {TeacherCommandHandler} from "./commands/TeacherCommandHandler";
import {botToken} from "./config/discord.json"
import {DiscordMember} from "./types";

const bot = new Client();

bot.once('ready', () => {
	const teacherCommands = new TeacherCommandHandler()
	const studentCommands = new StudentCommandHandler()
	console.log('Ready!');
	bot.on("guildMemberAdd", async (member: DiscordMember) => {

		if (allowedServers.some(id => id === member.guild.id)) {
			console.log(`Member ${member.user.username} add in Guild: ${member.guild.name} at ${new Date()}`);
			const manager = await (await JoinManager.get(member.guild)).init();
			const interactor = new Interactor(member);
			await manager.addUser(await interactor.handle())
		}
	})

	bot.on("message", async message => {

		if (!message.author.bot) {

			try {
				await Promise.all([
					teacherCommands.handle(message),
					studentCommands.handle(message)
				])
			} catch (e) {
				console.error("Error in command handler", e, JSON.stringify(e));
			}
		}
	});

});


bot.login(botToken).then(() => {
	console.log("Bot is logged");
});
