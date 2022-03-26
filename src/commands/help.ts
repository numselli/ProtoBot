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
import discord from 'discord.js';
import type { Client, Message } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    log('i', 'Giving help command info!');
    const embed = new discord.MessageEmbed()
        .setTitle('ProtoBot Help')
        .setAuthor('ProtoBot')
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
        .setDescription('Here are all of my commands!');

    client.commandsConfig.forEach((command: { name: string; description: string; enabled: boolean; restrict: boolean | { users: string[] } }) => {
        embed.addField(
            command.name,
            `${command.description}${command.enabled ? '' : ' **[Disabled]**'}${command.restrict ? ' **[Restricted]**' : ''}`,
            true
        );
    });

    message.author
        .send({ embeds: [embed] })
        .then(() => {
            message.reply('Sent the help menu to your DM!');
        })
        .catch((e) => {
            message.reply(`**ERROR**: I failed to send the help menu to your DMs.\n\nThe error was: \`${e}\``);
            log('w', `Failed to send embed to user DMs for help: ${e}`);
            message.reply({ embeds: [embed] });
        });
}

// Config
export const config = {
    name: 'help',
    description: 'List all available commands!',
    enabled: true,
    aliases: ['h'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
