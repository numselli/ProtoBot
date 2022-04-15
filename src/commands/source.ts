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
import type CommandConfig from '@lib/interfaces/commands/CommandConfig';

function escapeMarkdown(text: string) {
    const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
    const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
    return escaped;
}

// Main
export async function run(client: Client, message: Message): Promise<void> {
    const messages = await message.channel.messages.fetch({ limit: 2 });

    const m: Message = messages.last() as Message;
    message.reply(`Content of message ID \`${m.id}\` in channel <#${m.channel.id}>:\n\n${escapeMarkdown(m.content)}`);
}

// Config
export const config: CommandConfig = {
    name: 'source',
    category: 'utility',
    description: 'Gets the source of the last message',
    usage: '',
    enabled: true,
    aliases: ['src'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
