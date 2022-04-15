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

import Logger from '@lib/interfaces/Logger';
import * as discord from 'discord.js';
import { Client } from 'discord.js';

export default async function handleRestart(client: Client, log: Logger): Promise<void> {
    // If we were restarted, based on the restartData Map, send the RestartTimer message to
    // the channel we were restarted in.
    log('i', 'Checking if we were restarted...');
    if (client.restartData.get('wasRestarted')) {
        log('i', 'We have restarted. Sending message...');
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
    else log('i', 'Not restarted.');
}
