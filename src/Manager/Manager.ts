import {Guild, Role} from "discord.js";
import {studentRoleConfig} from "../config";
import {JoinManager} from "./JoinManager";

export abstract class Manager {
    protected static instances: Map<string, JoinManager>
    protected guild: Guild;
    protected studentRole?: Role;

    public abstract init(): Promise<this>;

    protected async getStudentRole(): Promise<Role> {
        if (!this.studentRole) {

            this.studentRole = this.guild.roles.cache.find(role => role.name === studentRoleConfig.name);

            if (this.studentRole === undefined) {
                this.studentRole = await this.guild.roles.create({
                    data: {
                        ...studentRoleConfig,
                        permissions: []
                    }
                });
            }
        }
        return this.studentRole
    }
}