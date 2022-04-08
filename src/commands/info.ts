/**
 * ProtoBot -- A Discord furry bot
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

// Modules
import type { Client, Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';
import type CommandConfig from '@lib/interfaces/CommandConfig';

// Main
function fireStats(userID: string, message: Message, client: Client): void {
    const uData: any = client.userStatistics.get(userID);
    const embed = new MessageEmbed()
        .setTitle(`User info for ${userID}`)
        .addField('Hugs', (uData.hugs ?? 0).toString())
        .addField('uwus', (client.uwus.get(userID) ?? 0).toString())
        .addField('owos', (client.owos.get(userID) ?? 0).toString())
        .addField('Tildes', (client.tildes.get(userID) ?? 0).toString());
    message.reply({ embeds: [embed] });
}

export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    const userID = args[0]?.replace(/[<@!>]/g, '') ?? message.author.id;

    if (!client.userStatistics.get(userID)) {
        client.users
            .fetch(userID)
            .then((user) => {
                client.userStatistics.ensure(user.id, client.defaults.USER_STATISTICS);
                // @ts-ignore
                fireStats(userID, message, client);
            })
            .catch((reason: any) => {
                log('i', `Unknown user ${userID}!`);
                message.reply('Unknown user!');
                return;
            });
        return;
    } else fireStats(userID, message, client);
}

// Config
export const config: CommandConfig = {
    name: 'info',
    description: "Get a user's stats!",
    enabled: true,
    aliases: ['user'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
