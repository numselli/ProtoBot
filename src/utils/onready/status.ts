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

import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

export default function setStatus(client: LexiClient, log: LexiLogger): void {
    // Status handling code
    // We assume the main prefix is always the first in the array.
    const allStatuses: ['PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | 'COMPETING', string][] = [
        // First index is the initial one.
        ['WATCHING', 'for / - Written for furries, by furries!'],
        ['WATCHING', 'for / - uwu'],
        ['WATCHING', 'for / - ah yes, much furry'],
        ['WATCHING', 'for / - I am not an uwu cat! - one of the developers, probably.'],
        ['WATCHING', 'you type /'],
        ['PLAYING', 'with fire - type /'],
        ['LISTENING', 'for /'],
        ['COMPETING', 'with other furry bots - type /'],
        ['WATCHING', 'you. - type /']
    ];
    setInterval(() => {
        const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
        log.info(`Change status: ${status[1]} (${status[0]})`);
        client.user?.setActivity(status[1], { type: status[0] });
    }, 10 * 60 * 1000); // Every 10 minutes.
    log.info('Set status.');
    client.user?.setActivity(allStatuses[0][1], { type: allStatuses[0][0] });
}
