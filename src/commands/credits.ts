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

// Modules
import discord from 'discord.js';
import type { Client, Message } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';
import type CommandConfig from '@lib/interfaces/CommandConfig';

export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    // FIXME: remove command
    // Yes, the path does end in 's-' not, 's'. there's an emoji.
    message.reply(
        `This command is deprecated and is going to be removed in a future release of ProtoBot. You probably want to look at <${client.publicConfig.githubRepository}/tree/main/#contributors-> instead.`
    );
}

// Config
export const config: CommandConfig = {
    name: 'credits',
    description: 'See the bot credits!',
    enabled: true,
    aliases: [],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
