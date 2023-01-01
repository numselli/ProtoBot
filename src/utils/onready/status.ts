/*
 * Lexi -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022, 2023  0xLogN
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

import { ActivityType } from 'discord.js';

import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

// The bot always starts with the first in the list.
const allStatuses: [number, string][] = [
    // First index is the initial one.
    [ActivityType.Watching, 'for / - Written for furries, by furries!'],
    [ActivityType.Watching, 'for / - uwu'],
    [ActivityType.Watching, 'for / - ah yes, much furry'],
    [ActivityType.Watching, 'for / - I am not an uwu cat! - one of the developers, probably.'],
    [ActivityType.Watching, 'you type /'],
    [ActivityType.Playing, 'with fire - type /'],
    [ActivityType.Listening, 'for /'],
    [ActivityType.Competing, 'with other furry bots - type /'],
    [ActivityType.Watching, 'you. - type /']
];

let forcedStatus: [number, string] | null = null;

export default function setStatus(client: LexiClient, log: LexiLogger): void {
    setInterval(() => {
        if (forcedStatus === null) {
            const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
            log.info(`Change status: ${status[1]} (${status[0]})`);
            client.user?.setActivity(status[1], { type: status[0] });
        } else log.info('Not changing status: Forced status is set.');
    }, 10 * 60 * 1000); // Every 10 minutes.
    log.info('Set status.');
    client.user?.setActivity(allStatuses[0][1], { type: allStatuses[0][0] });
}

export function setForcedStatus(client: LexiClient, log: LexiLogger, status: [number, string]): void {
    forcedStatus = status;
    client.user?.setActivity(status[1], { type: status[0] });
    log.info(`Set forced status: ${status[1]} (${status[0]})`);
}

export function resetForcedStatus(client: LexiClient, log: LexiLogger): void {
    forcedStatus = null;
    const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
    client.user?.setActivity(status[1], { type: status[0] });
    log.info(`Reset status to a random status: ${ActivityType[status[0]]} ${status[1]}`);
}
