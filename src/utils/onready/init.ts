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

import { red } from 'colorette';

import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';

import publicConfig from '../../publicConfig';

export default function init(client: LexiClient, log: LexiLogger): void {
    // Count the total user counts up. We do this by getting the total user count
    // for each server and remove ourselves from it...
    const userCountsPerGuild = client.guilds.cache.map((g) => g.memberCount - 1);
    let userTotal = 0;
    // ...and iterate through them to increment our user total...
    userCountsPerGuild.forEach((item) => (userTotal += item));
    // ...and get the average guild-user ratio.
    const userAvg = userTotal / userCountsPerGuild.length;
    // prettier-ignore
    (() => {
        log.info(String.raw` ___      _______  __   __  ___  `);
        log.info(String.raw`|   |    |       ||  |_|  ||   | `);
        log.info(String.raw`|   |    |    ___||       ||   | `);
        log.info(String.raw`|   |    |   |___ |       ||   | `);
        log.info(String.raw`|   |___ |    ___| |     | |   | `);
        log.info(String.raw`|       ||   |___ |   _   ||   | `);
        log.info(String.raw`|_______||_______||__| |__||___| `);
    })();
    log.info('Ready!');
    log.info(`Running Lexi on commit ${process.env.LEXI_STARTSH_COMMIT} from ${publicConfig.githubRepository}.`);
    if (process.env.LEXI_STARTSH_DIRTYSOURCE) log.warn('Uncommitted changes present (dirty source tree)');

    if (process.env.PRODUCTION) log.info('Running in production mode. Verbose logging is disabled.');
    else log.info('Running in development mode. Verbose logging is enabled.');

    // A lot of chalk prefixes to show the counts. A better way to handle this?
    // Whoever wrote this (myself) needs some mental help.
    log.info(`Username: ${red(client.user!.tag)}`);
    log.info(`In ${red(client.guilds.cache.size)} guilds!`);
    log.info(`With ${red(client.channels.cache.size)} channels!`);
    log.info(`Total ${red(userTotal)} members, excluding myself!`);
    log.info(`Average user count over all guilds: ${red(Math.round(userAvg))}`);
}
