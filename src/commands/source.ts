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

function escapeMarkdown(text: string) {
    const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
    const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
    return escaped;
}

// Modules
import type { Client, Message, Collection } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    const messages = await message.channel.messages.fetch({ limit: 2 }) as Collection<string, Message>;

    const m: Message = messages.last() as Message;
    message.reply(`Content of message ID \`${m.id}\` in channel <#${m.channel.id}>:\n\n${escapeMarkdown(m.content)}`);
}

// Config
export const config = {
    name: 'source',
    description: 'Gets the source of the last message',
    enabled: true,
    aliases: ['src'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
