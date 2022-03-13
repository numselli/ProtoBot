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
    message.reply(`**Oh hewwo there <@${message.author.id}>!**

**I'm ProtoBot.**

I'm a Discord bot with furries in mind.

My maintainer's name is LogN or @BadBoyHaloCat#1826

Running on commit \`${process.env.PROTOBOT_STARTSH_COMMIT}\`.

My prefix is \`${client.config.prefixes[0]}\`.

Feel free to send a DM to **@BadBoyHaloCat#1826** for support.

**I'm open source!** https://github.com/thetayloredman/ProtoBot`);
}

// Config
export const config = {
    name: 'about',
    description: 'Learn about me!',
    enabled: true,
    aliases: [],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
