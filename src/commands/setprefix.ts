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

import type { Message } from 'discord.js';

import type CommandConfig from '#lib/interfaces/commands/CommandConfig';
import { Permissions } from '#lib/Permissions';
import LexiCommand from '#lib/structures/LexiCommand';

export default class SetPrefixCommand extends LexiCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'setprefix',
            category: 'other',
            description: "Set the guild's prefix",
            usage: '<prefix>',
            enabled: true,
            aliases: [],

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: Permissions.SERVER_ADMINISTRATOR
        };
    }

    public async run(message: Message<boolean>, args: string[]): Promise<void> {
        const { client, log } = this;
        if (!args[0]) {
            log.info('User requested to see the prefix');
            message.reply("Your guild's prefix is: " + client.guildData.get(message.guild!.id, 'prefix'));
            return;
        }

        client.guildData.set(message.guild!.id, args[0], 'prefix');
        message.reply('I have set your guild prefix to ' + args[0]);
    }
}
