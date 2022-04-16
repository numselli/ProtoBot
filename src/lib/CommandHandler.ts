/*
 * ProtoBot -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022  0xLogN
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type Logger from '@lib/interfaces/Logger';
import Command from '@lib/structures/Command';
import { Client, Message, TextChannel } from 'discord.js';
import fs from 'fs';

import { getPermissionsForUser } from './getPermissionsForUser';
import CommandConfig from './interfaces/commands/CommandConfig';

/**
 * CommandHandler handles the storage and effective management of commands
 * in ProtoBot.
 */
export default class CommandHandler {
    /** The logger for this command handler. */
    private log: Logger;

    /** The internal storage facility for the commands. */
    private _commandClassInstances: Map<string, Command>;
    private _commandConfigs: Map<string, CommandConfig>;
    private _commandRefs: Map<string, string>;
    private client: Client;

    /** The commands folder. */
    private readonly commandsFolder: string;

    /**
     * Create a new command handler.
     * @param logger The logger to use. This is a global logger, so it is not dependent on the client.
     * @param commandsFolder The folder that commands are located in.
     */
    public constructor(logger: Logger, commandsFolder: string, client: Client) {
        this.log = logger;
        this._commandClassInstances = new Map();
        this._commandConfigs = new Map();
        this._commandRefs = new Map();
        this.commandsFolder = commandsFolder;
        this.client = client;

        // Common issue in the folder name.
        if (!this.commandsFolder.endsWith('/')) this.commandsFolder += '/';

        this.log('v', `CommandHandler: new command handler ready, commands folder is ${commandsFolder}`);
    }

    private _resetStore(): void {
        this._commandClassInstances.clear();
        this._commandConfigs.clear();
        this._commandRefs.clear();
    }

    /**
     * Loads all commands from the commands folder specified in the constructor.
     */
    public loadCommands(): void {
        this._resetStore();

        this.log('v', `CommandHandler: loading commands from ${this.commandsFolder}`);

        // Read the root directory of the commands.
        let files: string[] = [];
        try {
            files = fs.readdirSync(this.commandsFolder).filter((path) => path.endsWith('.js'));
        } catch (e) {
            this.log('e', `Failed to read directory ${this.commandsFolder}:`);
            this.log('e', e);
        }

        // Iterate over the files and load them.
        files.forEach(async (path) => {
            if (path.replace('.js', '').toLowerCase() !== path.replace('.js', '')) {
                this.log('w', `CommandCasedWarning: Command at ${path} has a name with a capital letter!`);
                this.log('w', `Will be loaded as "${path.replace('.js', '').toLowerCase()}"!`);
                // Normalize the path. This should never be needed.
                path = path.toLowerCase();
            }

            // The command data is loaded from the path.
            this.log('v', `Loading command "${path.replace('.js', '')}"...`);
            const CommandClass = (await import('../' + this.commandsFolder + path)).default as Command;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const command = new CommandClass(this.client, this.log);
            const cmdName = path.replace('.js', '');
            const cmdConfig = command.getConfig();
            this._commandConfigs.set(cmdName, cmdConfig);
            this._commandClassInstances.set(cmdName, command);
            this._commandRefs.set(cmdName, cmdName);
            cmdConfig.aliases.forEach((alias: string) => {
                this._commandRefs.set(alias, cmdName);
            });
            this.log('i', `Finished loading command "${cmdName}"!`);
        });
    }

    /** JUST FOR HELP! */
    public __readConfiguration__(): Map<string, CommandConfig> {
        return this._commandConfigs;
    }
    public __readRefs__(): Map<string, string> {
        return this._commandRefs;
    }

    /**
     * Execute a command after performing checks.
     */
    public run(commandName: string, args: string[], message: Message, client: Client): Promise<unknown> {
        // verbose info
        this.log('v', `Running command "${commandName}" for "${message.author.tag}" with args "${args.join(' ')}"!`);
        this.log(
            'v',
            `Command found at: ${message.guild!.name} (${message.guild!.id}) => #${(message.channel as TextChannel).name} (${
                message.channel.id
            }) => ${message.id}`
        );

        this.log('v', 'Resolving alias...');
        commandName = this._commandRefs.get(commandName) ?? '';
        this.log('v', `Alias resolved to "${commandName}"!`);

        const commandData: Command | undefined = this._commandClassInstances.get(commandName);
        if (!commandData) {
            // exit
            this.log('i', `Failed to find command "${commandName}", exiting handler.`);
            return Promise.resolve();
        }

        const commandConfig = commandData.getConfig();
        // Now we check for specific things to prevent the command from running
        // in it's configuration.
        if (!commandConfig.enabled) {
            this.log('i', `Command "${commandName}" is disabled (for ${message.author.tag}), exiting handler.`);
            this.log('i', 'Command is disabled!');
            message.reply('That command is disabled!');
            return Promise.resolve();
        }
        if (
            commandConfig.restrict &&
            ((typeof commandConfig.restrict === 'number' && getPermissionsForUser(client, this.log, message) < commandConfig.restrict) ||
                (commandConfig.restrict instanceof Array && !commandConfig.restrict.includes(message.author.id)))
        ) {
            // User isn't authorized; the user is either not whitelisted to use the command and/or they're not an owner.
            this.log(
                'i',
                `Command "${commandName}" is UNAUTHORIZED (for ${message.author.tag}), got ${getPermissionsForUser(
                    client,
                    this.log,
                    message
                )}, wanted >= ${commandConfig.restrict}, exiting handler.`
            );
            message.reply("You aren't authorized to do that!");
            return Promise.resolve();
        }

        // eslint-disable-next-line consistent-return
        return commandData.run(message, args);
    }
}
