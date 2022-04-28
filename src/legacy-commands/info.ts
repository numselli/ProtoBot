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
import { MessageEmbed } from 'discord.js';

import type CommandConfig from '#lib/interfaces/commands/LegacyLexiCommandConfig';
import LegacyLexiCommand from '#lib/structures/LegacyLexiCommand';
import type LexiClient from '#lib/structures/LexiClient';

function fireStats(userID: string, message: Message, client: LexiClient): void {
    const uData = client.userStatistics.get(userID)!;
    const ETD = client.emoteCounterTrackers.get(userID)!;
    const embed = new MessageEmbed()
        .setTitle(`User info for ${userID}`)
        .addField('Hugs', uData.hugs.toString())
        .addField('Boops', uData.boops.toString())
        .addField('Pats', uData.pats.toString())
        .addField('uwus', ETD.uwus.toString())
        .addField('owos', ETD.owos.toString())
        .addField('Tildes', ETD.tildes.toString())
        .setColor(client.publicConfig.colors.color1);
    message.reply({ embeds: [embed] });
}

export default class InfoCommand extends LegacyLexiCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'info',
            category: 'utility',
            description: "Get a user's stats!",
            usage: '[user]',
            enabled: true,
            aliases: ['user'],

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }
    public async run(message: Message<boolean>, args: string[]): Promise<void> {
        const { client, log } = this;
        const userID = args[0]?.replace(/[<@!>]/g, '') ?? message.author.id;

        if (!client.userStatistics.get(userID)) {
            client.users
                .fetch(userID)
                .then((user) => {
                    client.userStatistics.ensure(user.id, client.defaults.USER_STATISTICS);
                    fireStats(userID, message, client);
                })
                .catch(() => {
                    log.info(`Unknown user ${userID}!`);
                    message.reply('Unknown user!');
                    return;
                });
            return;
        } else fireStats(userID, message, client);
    }
}
