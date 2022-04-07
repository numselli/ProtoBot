/**
 * ProtoBot -- A Discord furry bot
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
import Command from './interfaces/Command';
import fs from 'fs';
import { Client, Message } from 'discord.js';

/**
 * CommandHandler handles the storage and effective management of commands
 * in ProtoBot.
 */
export default class CommandHandler {
    /** The logger for this command handler. */
    private log: Logger;

    /** The internal storage facility for the commands. */
    private _commandRunners: Map<string, Command>;
    private _commandConfigs: Map<string, Command['config']>;
    private _commandRefs: Map<string, string>;

    /** The commands folder. */
    private readonly commandsFolder: string;

    /**
     * Create a new command handler.
     * @param logger The logger to use. This is a global logger, so it is not dependent on the client.
     * @param commandsFolder The folder that commands are located in.
     */
    constructor(logger: Logger, commandsFolder: string) {
        this.log = logger;
        this._commandRunners = new Map();
        this._commandConfigs = new Map();
        this._commandRefs = new Map();
        this.commandsFolder = commandsFolder;

        // Common issue in the folder name.
        if (!this.commandsFolder.endsWith('/')) this.commandsFolder += '/';

        this.log('v', `CommandHandler: new command handler ready, commands folder is ${commandsFolder}`);
    }

    /**
     * Loads all commands from the commands folder specified in the constructor.
     */
    public loadCommands(): void {
        this.log('v', `CommandHandler: loading commands from ${this.commandsFolder}`);

        // Read the root directory of the commands.
        let files: string[] = [];
        try {
            files = fs.readdirSync(this.commandsFolder);
        } catch (e) {
            this.log('e', `Failed to read directory ${this.commandsFolder}:`);
            this.log('e', e);
        }

        // Iterate over the files and load them.
        files.forEach((path) => {
            // Ensure that what we are reading is a core JavaScript compiled file.
            if (path.endsWith('.js')) {
                // Check that this file does not contain capitalized letters in it's names.
                // This is a violation. Logged as: 'CommandCasedWarning'
                if (path.replace('.js', '').toLowerCase() !== path.replace('.js', '')) {
                    this.log('w', `CommandCasedWarning: Command at ${path} has a name with a capital letter!`);
                    this.log('w', `Will be loaded as "${path.replace('.js', '').toLowerCase()}"!`);
                    // Normalize the path. This should never be needed.
                    path = path.toLowerCase();
                }

                // The command data is loaded from the path.
                const commandData = <
                    Command // Already normalized above.
                >require('@root/' + this.commandsFolder + path);
                const cmdName = path.replace('.js', '');
                this.log('v', `Loading command "${cmdName}"...`);
                this._commandConfigs.set(cmdName, commandData.config);
                this._commandRunners.set(cmdName, commandData);
                this._commandRefs.set(cmdName, cmdName);
                (commandData.config.aliases ?? []).forEach((alias) => {
                    this._commandRefs.set(alias, cmdName);
                });
                this.log('i', `Finished loading command "${cmdName}"!`);
            } else if (path.endsWith('.map')) return;
            // Ignore source maps
            // THIS IS A VIOLATION AND SHOULD NEVER THROW; We will not kill the process however.
            else this.log('w', `File in commands dir with unknown extension: ${path}`);
        });
    }

    /** JUST FOR HELP! */
    public __readConfiguration__(): Map<string, Command['config']> {
        return this._commandConfigs;
    }

    /**
     * Execute a command after performing checks.
     */
    public run(commandName: string, args: string[], message: Message, client: Client): Promise<unknown> {
        // verbose info
        this.log('v', `Running command "${commandName}" for "${message.author.tag}" with args "${args.join(' ')}"!`);
        this.log(
            'v',
            `Command found at: ${message.guild?.name ?? 'unknown'} (${message.guild?.id ?? 'unknown'}) => #${
                // @ts-ignore
                <string>message.channel?.name ?? '#unknown'
            } (${message.channel?.id ?? 'unknown'}) => ${message.id}`
        );

        this.log('v', 'Resolving alias...');
        commandName = this._commandRefs.get(commandName) ?? '';
        this.log('v', `Alias resolved to "${commandName}"!`);

        const commandData: Command | undefined = this._commandRunners.get(commandName);
        if (!commandData) {
            // exit
            this.log('i', `Failed to find command "${commandName}", exiting handler.`);
            return Promise.resolve();
        }

        const { run: commandExec, config: commandConfig } = commandData;
        // Now we check for specific things to prevent the command from running
        // in it's configuration.
        // TODO: be a little move verbose here with who and what
        if (!commandConfig.enabled) {
            this.log('i', 'Command is disabled!');
            message.reply('That command is disabled!');
            return Promise.resolve();
        }
        if (
            commandConfig.restrict &&
            commandConfig.restrict.users &&
            !commandConfig.restrict.users.includes(message.author.id) &&
            message.author.id !== client.config.ownerID
        ) {
            // User isn't authorised; the user is either not whitelisted to use the command and/or they're not an owner.
            this.log('i', 'User unauthorized!');
            message.reply("You aren't authorized to do that!");
            return Promise.resolve();
        }

        // eslint-disable-next-line consistent-return
        return commandExec(client, message, args, this.log);
    }
}
