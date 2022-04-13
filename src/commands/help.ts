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

// Modules
import discord from 'discord.js';
import type { Client, Message } from 'discord.js';
import type CommandConfig from '@lib/interfaces/commands/CommandConfig';
import CommandCategory from '@lib/interfaces/commands/CommandCategory';

// Main
export async function run(client: Client, message: Message, args: string[]): Promise<void> {
    // Create a list of command-category mappings
    const maps: [string, CommandCategory][] = [];

    client.commands.__readConfiguration__().forEach((command) => {
        maps.push([command.name, command.category]);
    });

    // Filter the list to unique categories
    const categories: CommandCategory[] = maps.map((x) => x[1]).filter((value, index, self) => self.indexOf(value) === index);

    // Determine each command under a specific category
    const commandsInCategory: [CommandCategory, string[]][] = [];
    categories.forEach((category) => {
        commandsInCategory.push([category, maps.filter((command) => command[1] === category).map((command) => command[0])]);
    });

    console.log(args, categories);

    if (!args[0]) {
        const embed = new discord.MessageEmbed()
            .setTitle('ProtoBot Help')
            .setAuthor({ name: 'ProtoBot' })
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setDescription('No category was specified. Use `help [category]` to see the commands in a category. Here is a list of categories:');

        // Add each category to the embed
        commandsInCategory.forEach((category) => {
            if (category[0] === 'owner' && message.author.id !== client.config.ownerID) return;

            embed.addField(category[0].toString(), category[1].join(', '), true);
        });

        message.reply({ embeds: [embed] });
        return;
    } else if (categories.includes(args[0].toLowerCase() as CommandCategory)) {
        const embed = new discord.MessageEmbed()
            .setTitle('ProtoBot Help')
            .setAuthor({ name: 'ProtoBot' })
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setDescription(`Here are the commands in the category *${args[0].toLowerCase()}*:`);

        // Add each command to the embed
        commandsInCategory.forEach((category) => {
            if (category[0] === (args[0].toLowerCase() as CommandCategory))
                category[1].forEach((command) => {
                    const commandData = client.commands.__readConfiguration__().get(command) as CommandConfig;
                    embed.addField(
                        commandData.name,
                        `${commandData.description}${commandData.enabled ? '' : ' (disabled)'}${commandData.restrict ? ' (restricted)' : ''}`,
                        true
                    );
                });
        });

        message.reply({ embeds: [embed] });
        return;
    } else if (args[0] === 'all') {
        const embed = new discord.MessageEmbed()
            .setTitle('ProtoBot Help')
            .setAuthor({ name: 'ProtoBot' })
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setDescription('Here are all of my commands!');

        client.commands.__readConfiguration__().forEach((command) => {
            embed.addField(
                command.name,
                `*${command.category}* ${command.description}${command.enabled ? '' : ' **[Disabled]**'}${
                    command.restrict ? ' **[Restricted]**' : ''
                }`,
                true
            );
        });
    } else if (client.commands.__readConfiguration__().get(args[0].toLowerCase())) {
        const command = client.commands.__readConfiguration__().get(args[0].toLowerCase()) as CommandConfig;
        const embed = new discord.MessageEmbed()
            .setTitle('ProtoBot Help')
            .setAuthor({ name: 'ProtoBot' })
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setDescription(`Here is the help for the command *${command.name}*`)
            .addField('Description', command.description, true)
            .addField('Category', command.category, true)
            .addField('Enabled', command.enabled ? 'Yes' : 'No', true)
            .addField('Restricted', command.restrict ? 'Yes' : 'No', true)
            .addField('Usage', `\`${client.config.prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\``, true);

        if (command.aliases.length !== 0) embed.addField('Aliases', command.aliases.join(', '), true);

        message.reply({ embeds: [embed] });
        return;
    } else {
        message.reply(`I don't have a commands or category named '*${args[0]}*'. Run \`help\` to see all categories.`);
        return;
    }
}

// Config
export const config: CommandConfig = {
    name: 'help',
    category: 'utility',
    description: 'List all available commands!',
    usage: '[category or command]',
    enabled: true,
    aliases: ['h'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
