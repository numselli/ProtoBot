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

import type {SlashCommandBuilder} from '@discordjs/builders'
import type { Message } from 'discord.js';

import type CommandConfig from '#lib/interfaces/commands/LegacyLexiCommandConfig';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

export default abstract class LexiSlashCommand {
    protected client: LexiClient;
    protected log: LexiLogger;

    /**
     * Prepare a new instance of this command.
     * @param client The Discord client.
     * @param log The logger to use.
     */
    public constructor(client: LexiClient, log: LexiLogger) {
        this.client = client;
        this.log = log;
    }

    /** Run before the builder is run. */
    public async preLoadHook(): Promise<void> {
        // noop
    }
    public abstract buildSlashCommand(builder: SlashCommandBuilder): SlashCommandBuilder;
    /** Run after building the command, but before it is written to the DB. */
    public async postLoadHook(): Promise<void> {
        // noop
    }
    /** Execute this command. */
    public abstract run(message: Message, args: string[]): Promise<void>;
    /** Prepare this command config. */
    public abstract getConfig(): CommandConfig;
}
