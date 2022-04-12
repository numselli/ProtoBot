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

// Modules
import type { Client, Message } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';
import type CommandConfig from '@lib/interfaces/CommandConfig';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    const userID = args[0]?.replace(/[<@!>]/g, '');

    if (!args[0]) {
        log('i', `Not specified who to boop in boop.ts`);
        message.reply('Who did you want to boop?');
        return;
    }

    if (userID === message.author.id) {
        message.reply(`**Self boop?**\n<@${message.author.id}> boops themselves..?`);
        return;
    }

    client.userStatistics.ensure(userID, client.defaults.USER_STATISTICS);
    client.userStatistics.inc(userID, 'boops');

    message.reply(`**Boop!**\n<@${message.author.id}> boops <@${userID}>~!\n\nhttps://cdn.discordapp.com/emojis/777752005820416000.gif`);
}

// Config
export const config: CommandConfig = {
    name: 'boop',
    description: 'Boop someone!',
    enabled: true,
    aliases: [],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
