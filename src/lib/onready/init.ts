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

import Logger from '@lib/interfaces/Logger';
import chalk from 'chalk';
import { Client } from 'discord.js';

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
        log.info(' _______  ______   _______ _________');
        log.info('(  ____ )(  ___ \\ (  ___  )\\__   __/');
        log.info('| (    )|| (   ) )| (   ) |   ) (  '); 
        log.info('| (____)|| (__/ / | |   | |   | |  '); 
        log.info('|  _____)|  __ (  | |   | |   | |  '); 
        log.info('| (      | (  \\ \\ | |   | |   | |  '); 
        log.info('| )      | )___) )| (___) |   | |  '); 
        log.info('|/       |/ \\___/ (_______)   )_(  '); 
    })();
    log.info('Ready!');
    log.info(`Running Lexi on commit ${process.env.LEXI_STARTSH_COMMIT}.`);
    if (process.env.LEXI_STARTSH_DIRTYSOURCE) log.warn('Uncommitted changes present (dirty source tree)');

    if (process.env.PRODUCTION) log.info('Running in production mode. Verbose logging is disabled.');
    else log.info('Running in development mode. Verbose logging is enabled.');

    // A lot of chalk prefixes to show the counts. A better way to handle this?
    // Whoever wrote this (myself) needs some mental help.
    log.info(`Username: ${chalk.red(client.user!.tag)}`);
    log.info(`In ${chalk.red(client.guilds.cache.size)} guilds!`);
    log.info(`With ${chalk.red(client.channels.cache.size)} channels!`);
    log.info(`Total ${chalk.red(userTotal)} members, excluding myself!`);
    log.info(`Average user count over all guilds: ${chalk.red(Math.round(userAvg))}`);
    log.info(`Prefix is set to '${client.config.prefix}'.`);
}
