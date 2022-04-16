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

import type CommandConfig from '@lib/interfaces/commands/CommandConfig';
import Command from '@lib/structures/Command';
import type { Message } from 'discord.js';

export default class PatCommand extends Command {
    public getConfig(): CommandConfig {
        return {
            name: 'pat',
            category: 'affection',
            description: 'Pat someone!',
            usage: '',
            enabled: true,
            aliases: [],

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const { client, log } = this;
        const userID = args[0]?.replace(/[<@!>]/g, '');
        if (!args[0]) {
            log('i', 'No boop arg provided!');
            message.reply('Who did you want to pat?');
            return;
        }

        if (userID === message.author.id) {
            message.reply(`**Self pat?**\n<@${message.author.id}> pats themselves on the head..?`);
            return;
        }

        client.userStatistics.ensure(userID, client.defaults.USER_STATISTICS);
        client.userStatistics.inc(userID, 'pats');

        message.reply(`**Pat!**\n<@${message.author.id}> pats <@${userID}> on the head~!`);
    }
}
