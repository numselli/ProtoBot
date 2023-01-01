/*
 * Lexi -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022, 2023  0xLogN
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

import type { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type LexiCommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
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
    public async preLoadHook(_client: LexiClient): Promise<void> {
        // noop
    }
    /** Build this slash command. The LexiCommandHandler already sets name & description for you. */
    public abstract buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody;
    /** Run after building the command, but before it is written to the DB. */
    public async postLoadHook(_client: LexiClient): Promise<void> {
        // noop
    }
    /** Execute this command. */
    public abstract run(interaction: ChatInputCommandInteraction): Promise<void>;
    /** Prepare this command config. */
    public abstract getConfig(): LexiCommandConfig;
}
