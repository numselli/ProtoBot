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
import type { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
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

    public async run(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'cat') {
            await interaction.reply('Fetching a cat picture...');
            const body = (await fetch('https://some-random-api.ml/img/cat').then((res) => res.json())) as SomeRandomAPILinkData;
            const embed = new EmbedBuilder()
                .setTitle(`Cat for ${interaction.user.username}`)
                .setImage(body.link)
                .setTimestamp(Date.now())
                .setColor('Random');
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'dog') {
            await interaction.reply('Fetching a dog picture...');
            const body = (await fetch('https://some-random-api.ml/img/dog').then((res) => res.json())) as SomeRandomAPILinkData;
            const embed = new EmbedBuilder()
                .setTitle(`Dog for ${interaction.user.username}`)
                .setImage(body.link)
                .setTimestamp(Date.now())
                .setColor('Random');
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'fox') {
            await interaction.reply('Fetching a fox picture...');
            const body = (await fetch('https://randomfox.ca/floof/').then((res) => res.json())) as FoxData;
            const embed = new EmbedBuilder()
                .setTitle(`Fox for ${interaction.user.username}`)
                .setImage(body.image)
                .setTimestamp(Date.now())
                .setDescription(`[Link](${body.link})`)
                .setColor('Random');
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.reply('The bot is probably broken. Notify a developer. The issue was: Invalid subcommand in image.');
            throw new Error('This should never happen.');
        }
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        return builder
            .addSubcommand((sub) => sub.setName('cat').setDescription('Get a cute cat picture~!'))
            .addSubcommand((sub) => sub.setName('dog').setDescription('Get a cute dog picture~!'))
            .addSubcommand((sub) => sub.setName('fox').setDescription('Get a cute fox picture~!'));
    }
}
