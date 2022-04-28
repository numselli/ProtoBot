/*
 * Lexi -- A Discord bot for furries and non-furs alike!
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

/* eslint-disable no-await-in-loop */

import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import type { CommandInteraction, Message, TextChannel } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';

import { getPermissionsForUser } from '#lib/getPermissionsForUser';
import type LegacyLexiCommandConfig from '#lib/interfaces/commands/LegacyLexiCommandConfig';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LegacyLexiCommand from '#lib/structures/LegacyLexiCommand';
import type LexiClient from '#lib/structures/LexiClient';
import type LexiSlashCommand from '#lib/structures/LexiSlashCommand';

import { getInteractionPermissions } from './getInteractionPermissions';

/**
 * CommandHandler handles the storage and effective management of commands
 * in Lexi.
 */
export default class LexiCommandHandler {
    /** The logger for this command handler. */
    private log: LexiLogger;

    /** The internal storage facility for the commands. */
    /** @deprecated This is a Legacy Lexi feature. */
    private _LEGACY_commandClassInstances: Map<string, LegacyLexiCommand>;
    /** @deprecated This is a Legacy Lexi feature. */
    private _LEGACY_commandConfigs: Map<string, LegacyLexiCommandConfig>;
    /** @deprecated This is a Legacy Lexi feature. */
    private _LEGACY_commandRefs: Map<string, string>;
    private _commands: Map<string, LexiSlashCommand>;
    private client: LexiClient;
    private rest: REST;

    /** The commands folder. */
    private readonly LEGACY_commandsFolder: string;
    private readonly slashFolder: string;
    private _slashJSONs: RESTPostAPIApplicationCommandsJSONBody[];

    /**
     * Create a new command handler.
     * @param logger The logger to use. This is a global logger, so it is not dependent on the client.
     * @param commandsFolder The folder that commands are located in.
     */
    public constructor(logger: LexiLogger, commandsFolder: string, client: LexiClient) {
        this.log = logger;
        this._LEGACY_commandClassInstances = new Map();
        this._LEGACY_commandConfigs = new Map();
        this._LEGACY_commandRefs = new Map();
        this._commands = new Map();
        this.LEGACY_commandsFolder = commandsFolder;
        this.slashFolder = client.config.dirs.slashCommands;
        this.client = client;
        this._slashJSONs = [];
        this.rest = new REST({ version: '9' }).setToken(this.client.config.token);

        // Common issue in the folder name.
        if (!this.LEGACY_commandsFolder.endsWith('/')) this.LEGACY_commandsFolder += '/';
        if (!this.slashFolder.endsWith('/')) this.slashFolder += '/';

        this.log.verbose(`CommandHandler: new command handler ready, commands folder is ${commandsFolder}`);
    }

    /** @deprecated This is a Legacy Lexi feature. */
    private _LEGACY_resetStore(): void {
        this._LEGACY_commandClassInstances.clear();
        this._LEGACY_commandConfigs.clear();
        this._LEGACY_commandRefs.clear();
    }

    /**
     * Loads all commands from the commands folder specified in the constructor.
     * @deprecated This is a Legacy Lexi feature.
     */
    public LEGACY_loadCommands(): void {
        this._LEGACY_resetStore();

        this.log.verbose(`CommandHandler: loading commands from ${this.LEGACY_commandsFolder}`);

        // Read the root directory of the commands.
        let files: string[] = [];
        try {
            files = fs.readdirSync(this.LEGACY_commandsFolder).filter((path) => path.endsWith('.js'));
        } catch (e) {
            this.log.error(`Failed to read directory ${this.LEGACY_commandsFolder}:`);
            this.log.errorWithStack(e);
        }

        // Iterate over the files and load them.
        files.forEach(async (path) => {
            if (path.replace('.js', '').toLowerCase() !== path.replace('.js', '')) {
                this.log.warn(`CommandCasedWarning: Command at ${path} has a name with a capital letter!`);
                this.log.warn(`Will be loaded as "${path.replace('.js', '').toLowerCase()}"!`);
                // Normalize the path. This should never be needed.
                path = path.toLowerCase();
            }

            // The command data is loaded from the path.
            this.log.verbose(`Loading command "${path.replace('.js', '')}"...`);
            const CommandClass = (await import(`../${this.LEGACY_commandsFolder}${path}`)).default as LegacyLexiCommand;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const command = new CommandClass(this.client, this.log);
            const cmdName = path.replace('.js', '');
            const cmdConfig = command.getConfig();
            this._LEGACY_commandConfigs.set(cmdName, cmdConfig);
            this._LEGACY_commandClassInstances.set(cmdName, command);
            this._LEGACY_commandRefs.set(cmdName, cmdName);
            cmdConfig.aliases.forEach((alias: string) => {
                this._LEGACY_commandRefs.set(alias, cmdName);
            });
            this.log.info(`Finished loading command "${cmdName}"!`);
        });
    }

    /**
     * Loads all commands from the commands folder specified in the constructor.
     */
    public async loadCommands(): Promise<void> {
        this._commands = new Map();
        this._slashJSONs = [];
        const { client, log, rest } = this;

        log.verbose(`CommandHandler: loading application (/) commands from ${this.slashFolder}`);

        // Read the root directory of the commands.
        let files: string[] = [];
        try {
            files = fs.readdirSync(this.slashFolder).filter((path) => path.endsWith('.js'));
        } catch (e) {
            log.error(`Failed to read directory ${this.slashFolder}:`);
            log.errorWithStack(e);
        }

        // Iterate over the files and load them.
        for (let path of files) {
            if (path.replace('.js', '').toLowerCase() !== path.replace('.js', '')) {
                log.warn(`CommandCasedWarning: Command at ${path} has a name with a capital letter!`);
                log.warn(`Will be loaded as "${path.replace('.js', '').toLowerCase()}"!`);
                // Normalize the path. This should never be needed.
                path = path.toLowerCase();
            }

            // The command data is loaded from the path.
            log.verbose(`Loading slash command "${path.replace('.js', '')}"...`);
            const CommandClass = (await import(`../${this.slashFolder}${path}`)).default as LexiSlashCommand;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const command: LexiSlashCommand = new CommandClass(this.client, log);
            await command.preLoadHook(client);
            const cmdConfig = command.getConfig();
            const json = command.buildSlashCommand(new SlashCommandBuilder()).toJSON();
            await command.postLoadHook(client);
            this._commands.set(cmdConfig.name, command);
            this._slashJSONs.push(json);
            log.info(`Finished loading slash command "${cmdConfig.name}"!`);
        }

        // Push the new commands list to the API.
        log.info('Pushing new application commands to API...');
        await rest.put(Routes.applicationCommands(client.application!.id), { body: this._slashJSONs });
        log.info('Finished reloading application (/) commands.');
    }

    public async run(interaction: CommandInteraction): Promise<unknown> {
        const commandData: LexiSlashCommand | undefined = this._commands.get(interaction.commandName);
        if (!commandData) {
            interaction.reply({
                content: 'Uhhh... this should never happen. You ran a command and it was not ready to use. Please report this to the developers.',
                ephemeral: true
            });
            return Promise.reject('uh oh. unknown cmd.');
        }
        const commandConfig = commandData.getConfig();
        if (!commandConfig.enabled) {
            interaction.reply({
                content: 'This command is currently disabled.',
                ephemeral: true
            });
            return Promise.resolve('command disabled.');
        }
        if (
            commandConfig.restrict &&
            ((typeof commandConfig.restrict === 'number' && getInteractionPermissions(this.client, this.log, interaction) < commandConfig.restrict) ||
                (commandConfig.restrict instanceof Array && !commandConfig.restrict.includes(interaction.user.id)))
        ) {
            // User isn't authorized; the user is either not whitelisted to use the command and/or they're not an owner.
            this.log.info(
                `Command slash:"/${interaction.commandName}" is UNAUTHORIZED (for ${interaction.user.tag}), got ${getInteractionPermissions(
                    this.client,
                    this.log,
                    interaction
                )}, wanted >= ${String(commandConfig.restrict)}, exiting handler.`
            );
            await interaction.reply("You aren't authorized to do that!");
            return Promise.resolve();
        }
        return commandData.run(interaction);
    }

    /** JUST FOR HELP! */
    /** @deprecated This is a Legacy Lexi feature. */
    public _LEGACY__readConfiguration__(): Map<string, LegacyLexiCommandConfig> {
        return this._LEGACY_commandConfigs;
    }
    /** @deprecated This is a Legacy Lexi feature. */
    public _LEGACY__readRefs__(): Map<string, string> {
        return this._LEGACY_commandRefs;
    }

    /**
     * Execute a command after performing checks.
     * @deprecated This is a Legacy Lexi feature.
     */
    public async LEGACY_run(commandName: string, args: string[], message: Message, client: LexiClient): Promise<unknown> {
        // verbose info
        this.log.verbose(`Running command "${commandName}" for "${message.author.tag}" with args "${args.join(' ')}"!`);
        this.log.verbose(
            `Command found at: ${message.guild!.name} (${message.guild!.id}) => #${(message.channel as TextChannel).name} (${
                message.channel.id
            }) => ${message.id}`
        );

        this.log.verbose('Resolving alias...');
        commandName = this._LEGACY_commandRefs.get(commandName) ?? '';
        this.log.verbose(`Alias resolved to "${commandName}"!`);

        const commandData: LegacyLexiCommand | undefined = this._LEGACY_commandClassInstances.get(commandName);
        if (!commandData) {
            // exit
            this.log.info(`Failed to find command "${commandName}", exiting handler.`);
            return Promise.resolve();
        }

        const commandConfig = commandData.getConfig();
        // Now we check for specific things to prevent the command from running
        // in it's configuration.
        if (!commandConfig.enabled) {
            this.log.info(`Command "${commandName}" is disabled (for ${message.author.tag}), exiting handler.`);
            this.log.info('Command is disabled!');
            message.reply('That command is disabled!');
            return Promise.resolve();
        }
        if (
            commandConfig.restrict &&
            ((typeof commandConfig.restrict === 'number' && getPermissionsForUser(client, this.log, message) < commandConfig.restrict) ||
                (commandConfig.restrict instanceof Array && !commandConfig.restrict.includes(message.author.id)))
        ) {
            // User isn't authorized; the user is either not whitelisted to use the command and/or they're not an owner.
            this.log.info(
                `Command "${commandName}" is UNAUTHORIZED (for ${message.author.tag}), got ${getPermissionsForUser(
                    client,
                    this.log,
                    message
                )}, wanted >= ${String(commandConfig.restrict)}, exiting handler.`
            );
            message.reply("You aren't authorized to do that!");
            return Promise.resolve();
        }

        // eslint-disable-next-line consistent-return
        return commandData.run(message, args);
    }
}
