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

import type Logger from '@lib/interfaces/Logger';
import { doesHavePrefix } from '@lib/utils/doesHavePrefix';
import chalk from 'chalk';
import type { Client, Message } from 'discord.js';

export function run(client: Client, message: Message, log: Logger): void {
    // Get the user's current cooldowns (in timestamps)

    const cooldowns = client.cooldowns.ensure(message.author.id, client.defaults.COOLDOWNS).tildes;

    // Check cooldown
    if (!cooldowns || cooldowns + client.config.cooldowns.tildes - Date.now() < 1) {
        if (message.content.endsWith('~') && !/~~+/.test(message.content) && message.content !== '~' && !doesHavePrefix(message, client)) {
            //                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            //                           Don't flag strikethrough
            //                           markdown as a valid tilde!

            client.emoteCounterTrackers.ensure(message.author.id, client.defaults.EMOTE_TRACKER_COUNTERS);
            client.emoteCounterTrackers.inc(message.author.id, 'tildes');
            client.cooldowns.set(message.author.id, Date.now(), 'tildes');

            log(
                'i',
                `${chalk.green('[')}${chalk.green.bold('TildeHandler')}${chalk.green(']')} ${chalk.red('[')}${chalk.red.bold('+')}${chalk.red(
                    ']'
                )} Added tilde!`
            );
        }
    } else
        log(
            'i',
            `${chalk.green('[')}${chalk.green.bold('TildeHandler')}${chalk.green(']')} User still on cooldown! ${chalk.red(
                cooldowns + client.config.cooldowns.tildes - Date.now()
            )} ms remaining!`
        );
}

// Config
export const config = {
    name: 'tildes',
    description: 'Detects a message ending in ~ and logs it.'
};
