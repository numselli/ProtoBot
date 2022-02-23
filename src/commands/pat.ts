/**
 * ProtoBot -- A Discord furry bot
 * Copyright (C) 2020, 2021  BadBoyHaloCat
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

// Main
export function run(client: Client, message: Message, args: string[], log: Logger): void {
    let userID: string | undefined;
    if (!args[0]) {
        log('i', 'No boop arg provided!');
        message.reply('Who did you want to pat?');
        return;
    } else if (/<@!?.+>/.test(args[0])) userID = args[0].replace(/[<@!>]/g, '');
    else userID = args[0];

    if (userID === message.author.id) {
        message.reply(`**Self pat?**
<@${message.author.id}> pats themselves on the head..?`);
        return;
    }

    client.ustats.ensure(userID, client.defaults.USER_STATS);
    client.ustats.inc(userID, 'pats');

    message.reply(
        `**Pat!**
<@${message.author.id}> pats <@${userID}> on the head~!`
    );
}

// Config
export const config = {
    name: 'pat',
    description: 'Pat someone!',
    enabled: true,
    aliases: [],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
