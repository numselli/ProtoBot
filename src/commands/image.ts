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

// Imports
import type { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

interface SomeRandomAPILinkData {
    link: string;
}

interface FoxData {
    image: string;
    link: string;
}

export default class CatCommand extends LexiSlashCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'image',
            description: 'Get a picture of an animal!',
            enabled: true,

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        if (interaction.options.getSubcommand() === 'cat') {
            await interaction.reply('Fetching a cat picture...');
            const body = (await fetch('https://some-random-api.ml/img/cat').then((res) => res.json())) as SomeRandomAPILinkData;
            const embed = new MessageEmbed()
                .setTitle(`Cat for ${interaction.user.username}`)
                .setImage(body.link)
                .setTimestamp(Date.now())
                .setColor('RANDOM');
            await interaction.editReply({ embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'dog') {
            await interaction.reply('Fetching a dog picture...');
            const body = (await fetch('https://some-random-api.ml/img/dog').then((res) => res.json())) as SomeRandomAPILinkData;
            const embed = new MessageEmbed()
                .setTitle(`Dog for ${interaction.user.username}`)
                .setImage(body.link)
                .setTimestamp(Date.now())
                .setColor('RANDOM');
            await interaction.editReply({ embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'fox') {
            await interaction.reply('Fetching a fox picture...');
            const body = (await fetch('https://randomfox.ca/floof/').then((res) => res.json())) as FoxData;
            const embed = new MessageEmbed()
                .setTitle(`Fox for ${interaction.user.username}`)
                .setImage(body.image)
                .setTimestamp(Date.now())
                .setDescription(`[Link](${body.link})`)
                .setColor('RANDOM');
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.reply('The bot is probably broken. Notify a developer. The issue was: Invalid subcommand in image.');
            throw new Error('This should never happen.');
        }
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        const cfg = this.getConfig();
        return builder
            .setName(cfg.name)
            .setDescription(cfg.description)
            .addSubcommand((sub) => sub.setName('cat').setDescription('Get a cute cat picture~!'))
            .addSubcommand((sub) => sub.setName('dog').setDescription('Get a cute dog picture~!'))
            .addSubcommand((sub) => sub.setName('fox').setDescription('Get a cute fox picture~!'));
    }
}
