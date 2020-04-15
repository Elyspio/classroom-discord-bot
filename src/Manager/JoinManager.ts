import {CategoryChannel, Guild, GuildChannel, PermissionString, Role} from "discord.js";
import {classroomConfig, permissions} from "../config";
import {Member} from "../types";
import {Manager} from "./Manager";
import {ChannelHelper} from "../helper/ChannelHelper";


interface Channels {
    text: GuildChannel,
    voice: GuildChannel,
    category: CategoryChannel
}


export class JoinManager extends Manager {
    private classRooms?: Channels

    private constructor(guild: Guild) {
        super();
        this.guild = guild;
    }

    public static async get(guild: Guild): Promise<JoinManager>{
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
            roles: [this.studentRole as Role]
        })
        await this.createChannels(member);
    }

    public async init(): Promise<this> {
        this.guild = await this.guild.fetch();
        await this.guild.roles.everyone?.setPermissions(0)
        const {category, text, voice} = await this.getClassRooms();
        const role = await this.getStudentRole();
        await Promise.all([
            category.createOverwrite(role, this.convertPermissions(permissions.category)),
            text.createOverwrite(role, this.convertPermissions(permissions.text)),
            voice.createOverwrite(role, this.convertPermissions(permissions.voice))
        ])
        return this;
    }



    private async getClassRooms(): Promise<Channels> {
        if (!this.classRooms) {
            const l = ChannelHelper.vocalToText(classroomConfig.name);
            let channels = this.guild.channels.cache.filter(channel =>
                channel.name === classroomConfig.name ||
                channel.name === ChannelHelper.vocalToText(classroomConfig.name)
            ).array();

            if (channels.length < 3) {
                channels.forEach(channel => channel.delete())
                const category = await this.guild.channels.create(classroomConfig.name, {type: "category"})
                channels = [category, ...await Promise.all([
                    this.guild.channels.create(classroomConfig.name, {type: "text", parent: category}),
                    this.guild.channels.create(classroomConfig.name, {type: "voice", parent: category})
                ])]
            }

            this.classRooms = {
                category: channels[0] as CategoryChannel,
                text: channels[1],
                voice: channels[2]
            }
        }
        return this.classRooms
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

        let groupName = member.cpe.group as string;

        let channels = this.guild.channels.cache.filter(channel =>
            channel.name === groupName ||
            channel.name === ChannelHelper.vocalToText(groupName)
        ).array();

        let role = this.guild.roles.cache.find(role => role.name === groupName);

        if (channels.length !== 3) {
            channels.forEach(channel => channel.delete());
            const category = await this.guild.channels.create(groupName, {type: "category"});
            channels = [category, ...await Promise.all([
                this.guild.channels.create(groupName, {parent: category, type: "text"}),
                this.guild.channels.create(groupName, {parent: category, type: "voice"})
            ])];
        }

        if (role === undefined) {
            role = await this.guild.roles.create({data: {name: groupName}})
        }

        await Promise.all([
            channels[1].createOverwrite(role, this.convertPermissions(permissions.text)),
            channels[2].createOverwrite(role, this.convertPermissions(permissions.voice)),
        ])
        await member.discord.roles.add(role);
        return {
            category: channels[0],
            text: channels[1],
            voice: channels[2]
        }
    }


}