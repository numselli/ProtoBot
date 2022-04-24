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

import type * as discord from 'discord.js';

import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

export default async function handleRestart(client: LexiClient, log: LexiLogger): Promise<void> {
    // If we were restarted, based on the restartData Map, send the RestartTimer message to
    // the channel we were restarted in.
    log.info('Checking if we were restarted...');
    if (client.restartData.get('wasRestarted')) {
        log.info('We have restarted. Sending message...');
        const guild = client.guilds.cache.get(client.restartData.get('serverId') as string); // Fetch the server we restarted in...
        const channel = (await guild?.channels.cache.get(client.restartData.get('channelId') as string)) as discord.TextChannel; // ...and get the channel...
        const message = await channel?.messages.fetch(client.restartData.get('messageId') as string); // ...and finally the message.
        await message.reply(
            `Done! Restart complete in ${Date.now() - (client.restartData.get('time') as number)}ms (${
                (Date.now() - (client.restartData.get('time') as number)) / 1000
            } seconds).`
        );
        client.restartData.set('wasRestarted', false);
    }
    // A clean start
    else log.info('Not restarted.');
}
