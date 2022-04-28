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

import type { Message } from 'discord.js';

import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

export default abstract class LexiCommand {
    protected client: LexiClient;
    protected log: LexiLogger;

    public constructor(client: LexiClient, log: LexiLogger) {
        this.client = client;
        this.log = log;
    }

    public async preLoadHook(): Promise<void> {
        // noop
    }
    public async postLoadHook(): Promise<void> {
        // noop
    }
    public abstract run(message: Message, args: string[]): Promise<void>;
    public abstract getConfig(): CommandConfig;
}
