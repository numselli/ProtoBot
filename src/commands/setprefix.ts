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
import type CommandConfig from '@lib/interfaces/commands/CommandConfig';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    if (!args[0]) {
        log('i', 'User requested to see the prefix');
        message.reply("Your guild's prefix is: " + client.guildData.get(message.guild!.id, 'prefix'));
        return;
    }

    client.guildData.set(message.guild!.id, args[0], 'prefix');
    message.reply('I have set your guild prefix to ' + args[0]);
}

// Config
export const config: CommandConfig = {
    name: 'setprefix',
    category: 'other',
    description: "Set the guild's prefix",
    usage: '<prefix>',
    enabled: true,
    aliases: [],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: { guildAdmins: true }
};
