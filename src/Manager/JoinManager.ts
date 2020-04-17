import {
	CategoryChannel,
	Guild,
	GuildChannel,
	PermissionString,
	Role
} from "discord.js";
import {classroomConfig, permissions, roles} from "../config";
import {Level, Member} from "../types";
import {Manager} from "./Manager";
import {ChannelHelper} from "../helper/ChannelHelper";


interface Channels {
	text: GuildChannel,
	voice: GuildChannel,
	category: CategoryChannel,
	role?: Role
}


export class JoinManager extends Manager {
	private groupChannels: {
		classRoom?: Channels
		group1?: Channels,
		group2?: Channels
	}

	private constructor(guild: Guild) {
		super();
		this.guild = guild;
		this.groupChannels = {}
	}

	public static async get(guild: Guild): Promise<JoinManager> {
		if (!this.instances) {
			this.instances = new Map();
		}

		if (!this.instances.has(guild.id)) {
			this.instances.set(guild.id, new JoinManager(guild));
		}

		return this.instances.get(guild.id) as JoinManager;
	}

	public async addUser(member: Member) {
		await member.discord.edit({
			nick: `${member.cpe.firstname?.charAt(0).toLocaleUpperCase()}${member.cpe.firstname?.slice(1)} ${member.cpe.lastname?.toLocaleUpperCase()}`,
			roles: [
				await this.getStudentRole(),
				member.cpe.level === Level.NEW
					? this.groupChannels.group2.role
					: this.groupChannels.group1.role

			]
		})

		await this.createChannels(member);
	}

	public async init(): Promise<this> {
		this.guild = await this.guild.fetch();
		await this.guild.roles.everyone?.setPermissions(0)

		await super.getStudentRole();

		if (!this.guild.roles.cache.find(role => role.name === roles.prof.name)) {
			await this.guild.roles.create({data: roles.prof})
		}
		await this.createCommonChannels();
		return this;
	}

	private async getClassRooms(): Promise<Channels> {
		if (!this.groupChannels.classRoom) {
			let channels = this.guild.channels.cache.filter(channel =>
				channel.name === classroomConfig.name ||
				channel.name === ChannelHelper.vocalToText(classroomConfig.name)
			).array();

			const student = await super.getStudentRole();

			if (channels.length < 3) {
				channels.forEach(channel => channel.delete())
				const category = await this.guild.channels.create(classroomConfig.name, {type: "category"})
				channels = [category, ...await Promise.all([
					this.guild.channels.create(classroomConfig.name, {
						type: "text",
						parent: category,
						permissionOverwrites: [{
							allow: permissions.text,
							id: student.id
						}]
					}),
					this.guild.channels.create(classroomConfig.name, {
						type: "voice",
						parent: category,
						permissionOverwrites: [{
							allow: permissions.voice,
							id: student.id
						}]

					})
				])]
			}

			this.groupChannels.classRoom = {
				category: channels[0] as CategoryChannel,
				text: channels[1],
				voice: channels[2]
			}
		}
		return this.groupChannels.classRoom
	}

	private convertPermissions(permissions: PermissionString[]): { [key: string]: boolean } {
		let obj = {};
		permissions.forEach(perm => {
			// @ts-ignore
			obj[perm] = true
		})
		return obj;
	}

	private async createChannels(member: Member) {

		let binomeName = `binome-${member.cpe.group}`;
		const category = (member.cpe.level === Level.NEW ? this.groupChannels.group2 : this.groupChannels.group1).category;

		let binomeRole = this.guild.roles.cache.find(role => role.name === binomeName);
		if (binomeRole === undefined) {
			binomeRole = await this.guild.roles.create({data: {name: binomeName}})
		}

		let channels = this.guild.channels.cache.filter(channel =>
			channel.name === binomeName ||
			channel.name === ChannelHelper.vocalToText(binomeName)
		).array();
		if (channels.length !== 2) {
			channels.forEach(channel => channel.delete());

			channels = await Promise.all([
				this.guild.channels.create(binomeName, {
					parent: category,
					type: "text",
					permissionOverwrites: [{
						id: binomeRole.id,
						allow: permissions.text
					}]
				}),
				this.guild.channels.create(binomeName, {
					parent: category,
					type: "voice",
					permissionOverwrites: [{
						id: binomeRole.id,
						allow: permissions.voice
					}]
				})
			]);
		}


		await member.discord.roles.add(binomeRole);
		return {
			category: category,
			text: channels[1],
			voice: channels[2]
		}
	}

	private async createGroupChannel(level: Level): Promise<Channels> {
		const data = level === Level.NEW ? roles.grp2 : roles.grp1
		let category = this.guild.channels.cache.find(channel => channel.name === data.name && channel.type === "category") as CategoryChannel

		let role = this.guild.roles.cache.find(role => role.name === data.name);
		if (!role) {
			role = await this.guild.roles.create({data: data})
		}

		if (!category) {
			category = await this.guild.channels.create(data.name, {
				type: "category", permissionOverwrites: [
					{allow: permissions.category, id: role.id}
				]
			});
		}

		let text = this.guild.channels.cache.find(channel => ChannelHelper.vocalToText(channel.name) === ChannelHelper.vocalToText(data.name) && channel.type === "text")
		if (!text) {
			text = await this.guild.channels.create(data.name, {
				parent: category,
				type: "text", permissionOverwrites: [
					{allow: permissions.text, id: role.id}
				]
			});
		}

		let voice = this.guild.channels.cache.find(channel => ChannelHelper.vocalToText(channel.name) === ChannelHelper.vocalToText(data.name) && channel.type === "voice")
		if (!voice) {
			voice = await this.guild.channels.create(data.name, {
				parent: category,
				type: "voice", permissionOverwrites: [
					{allow: permissions.voice, id: role.id}
				]
			});
		}

		return {
			role,
			category,
			voice,
			text
		}


	}

	private async createCommonChannels() {
		// let grp1Cat = await this.guild.channels.create(Level.ADVANCED, {type: "category"})
		// let grp2Cat = await this.guild.channels.create(Level.NEW, {type: "category"})
		// let grp1Role = await this.guild.roles.create({data: roles.grp1});
		// let grp2Role = await this.guild.roles.create({data: roles.grp2});
		//
		//
		// const {category, text, voice} = await this.getClassRooms();
		// const role = await this.getStudentRole();
		//
		// const promises: Promise<GuildChannel>[] = [
		// 	this.guild.channels.create(Level.ADVANCED, {
		// 		type: "text",
		// 		parent: grp1Cat,
		// 	}),
		// 	this.guild.channels.create(Level.ADVANCED, {
		// 		type: "voice",
		// 		parent: grp1Cat
		// 	}),
		// 	this.guild.channels.create(Level.NEW, {
		// 		type: "text",
		// 		parent: grp2Cat
		// 	}),
		// 	this.guild.channels.create(Level.NEW, {
		// 		type: "voice",
		// 		parent: grp2Cat
		// 	}),
		// ]
		//
		//
		// const [grp1Text, grp1Voice, grp2Text, grp2Voice] = await Promise.all(promises);
		// let studentRole = await super.getStudentRole();
		//
		// const perms = {
		// 	text: this.convertPermissions(permissions.text),
		// 	vocal: this.convertPermissions(permissions.voice),
		// 	category: this.convertPermissions(permissions.category),
		// }
		//
		// await Promise.all([
		// 	grp1Cat.createOverwrite(studentRole, perms.category),
		// 	grp2Cat.createOverwrite(studentRole, perms.category),
		// 	category.createOverwrite(role, perms.category),
		// 	grp1Text.createOverwrite(grp1Role, perms.text),
		// 	grp2Text.createOverwrite(grp2Role, perms.text),
		// 	text.createOverwrite(role, perms.text),
		// 	grp1Voice.createOverwrite(grp1Role, perms.vocal),
		// 	grp2Voice.createOverwrite(grp1Role, perms.vocal),
		// 	voice.createOverwrite(role, perms.vocal)
		// ])

		const [classRoom, group1, group2] = await Promise.all([
			this.getClassRooms(),
			this.createGroupChannel(Level.ADVANCED),
			this.createGroupChannel(Level.NEW),
		])

		this.groupChannels = {
			group1,
			group2,
			classRoom
		}
	}
}
