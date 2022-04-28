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

import type LegacyLexiCommandCategory from '#lib/interfaces/commands/LegacyLexiCommandCategory';
import type CommandConfig from '#lib/interfaces/commands/LegacyLexiCommandConfig';
import LegacyLexiCommand from '#lib/structures/LegacyLexiCommand';

export default class HelpCommand extends LegacyLexiCommand {
    public getConfig(): CommandConfig {
        return {
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
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const { client } = this;
        // Create a list of command-category mappings
        const maps: [string, LegacyLexiCommandCategory][] = [];

        client.commands._LEGACY__readConfiguration__().forEach((command) => {
            maps.push([command.name, command.category]);
        });

        // Filter the list to unique categories
        const categories: LegacyLexiCommandCategory[] = maps.map((x) => x[1]).filter((value, index, self) => self.indexOf(value) === index);

        // Determine each command under a specific category
        const commandsInCategory: [LegacyLexiCommandCategory, string[]][] = [];
        categories.forEach((category) => {
            commandsInCategory.push([category, maps.filter((command) => command[1] === category).map((command) => command[0])]);
        });

        if (!args[0]) {
            const embed = new MessageEmbed()
                .setTitle('Lexi Help')
                .setAuthor({ name: 'Lexi' })
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setDescription('No category was specified. Use `help [category]` to see the commands in a category. Here is a list of categories:')
                .setColor(client.publicConfig.colors.color5);

            // Add each category to the embed
            commandsInCategory.forEach((category) => {
                if (category[0] === 'owner' && message.author.id !== client.config.ownerID) return;

                embed.addField(category[0].toString(), category[1].join(', '), true);
            });

            message.reply({ embeds: [embed] });
            return;
        } else if (categories.includes(args[0].toLowerCase() as LegacyLexiCommandCategory)) {
            const embed = new MessageEmbed()
                .setTitle('Lexi Help')
                .setAuthor({ name: 'Lexi' })
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setDescription(`Here are the commands in the category *${args[0].toLowerCase()}*:`)
                .setColor(client.publicConfig.colors.color5);

            // Add each command to the embed
            commandsInCategory.forEach((category) => {
                if (category[0] === (args[0].toLowerCase() as LegacyLexiCommandCategory))
                    category[1].forEach((command) => {
                        const commandData = client.commands._LEGACY__readConfiguration__().get(command) as CommandConfig;
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
            const embed = new MessageEmbed()
                .setTitle('Lexi Help')
                .setAuthor({ name: 'Lexi' })
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setDescription('Here are all of my commands!')
                .setColor(client.publicConfig.colors.color5);

            client.commands._LEGACY__readConfiguration__().forEach((command) => {
                embed.addField(
                    command.name,
                    `*${command.category}* ${command.description}${command.enabled ? '' : ' **[Disabled]**'}${
                        command.restrict ? ' **[Restricted]**' : ''
                    }`,
                    true
                );
            });
        } else if (client.commands._LEGACY__readRefs__().get(args[0].toLowerCase())) {
            const command = client.commands
                ._LEGACY__readConfiguration__()
                .get(client.commands._LEGACY__readRefs__().get(args[0].toLowerCase())!) as CommandConfig;
            const embed = new MessageEmbed()
                .setTitle('Lexi Help')
                .setAuthor({ name: 'Lexi' })
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setDescription(`Here is the help for the command *${command.name}*`)
                .addField('Description', command.description, true)
                .addField('Category', command.category, true)
                .addField('Enabled', command.enabled ? 'Yes' : 'No', true)
                .addField('Restricted', command.restrict ? 'Yes' : 'No', true)
                .addField(
                    'Usage',
                    `\`${client.guildData.get(message.guild!.id, 'prefix')}${command.name}${command.usage ? ` ${command.usage}` : ''}\``,
                    true
                );

            if (command.aliases.length !== 0) embed.addField('Aliases', command.aliases.join(', '), true);

            message.reply({ embeds: [embed] });
            return;
        } else {
            message.reply(`I don't have a commands or category named '*${args[0]}*'. Run \`help\` to see all categories.`);
            return;
        }
    }
}
