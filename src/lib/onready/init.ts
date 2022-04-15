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
import { Client } from 'discord.js';
import chalk from 'chalk';

export default function init(client: Client, log: Logger): void {
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
        log('i', ' _______  ______   _______ _________');
        log('i', '(  ____ )(  ___ \\ (  ___  )\\__   __/');
        log('i', '| (    )|| (   ) )| (   ) |   ) (  '); 
        log('i', '| (____)|| (__/ / | |   | |   | |  '); 
        log('i', '|  _____)|  __ (  | |   | |   | |  '); 
        log('i', '| (      | (  \\ \\ | |   | |   | |  '); 
        log('i', '| )      | )___) )| (___) |   | |  '); 
        log('i', '|/       |/ \\___/ (_______)   )_(  '); 
    })();
    log('i', 'Ready!');
    log('i', `Running ProtoBot on commit ${process.env.PROTOBOT_STARTSH_COMMIT}.`);
    if (process.env.PROTOBOT_STARTSH_DIRTYSOURCE) log('w', 'Uncommitted changes present (dirty source tree)');

    if (process.env.PRODUCTION) log('i', 'Running in production mode. Verbose logging is disabled.');
    else log('i', 'Running in development mode. Verbose logging is enabled.');

    // A lot of chalk prefixes to show the counts. A better way to handle this?
    // Whoever wrote this (myself) needs some mental help.
    log('i', `Username: ${chalk.red(client.user!.tag)}`);
    log('i', `In ${chalk.red(client.guilds.cache.size)} guilds!`);
    log('i', `With ${chalk.red(client.channels.cache.size)} channels!`);
    log('i', `Total ${chalk.red(userTotal)} members, excluding myself!`);
    log('i', `Average user count over all guilds: ${chalk.red(Math.round(userAvg))}`);
    log('i', `Prefix is set to '${client.config.prefix}'.`);
}
