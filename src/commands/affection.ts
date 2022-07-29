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

import type { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type LexiCommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

export default class BoopCommand extends LexiSlashCommand {
    public getConfig(): LexiCommandConfig {
        return {
            name: 'affection',
            description: 'Be affectionate!',
            enabled: true,

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(interaction: ChatInputCommandInteraction): Promise<void> {
        const { client } = this;
        const target = await interaction.options.getUser('target')!.fetch();
        if (['boop', 'pat', 'hug'].includes(interaction.options.getSubcommand()) && target.id === interaction.user.id) {
            await interaction.reply("You can't do that to yourself!");
            return;
        }
        if (interaction.options.getSubcommand() === 'boop') {
            client.userStatistics.ensure(target.id, client.defaults.USER_STATISTICS);
            client.userStatistics.inc(target.id, 'boops');
            await interaction.reply(
                `**Boop!**\n<@${interaction.user.id}> boops <@${target.id}>~!\n\nhttps://cdn.discordapp.com/emojis/777752005820416000.gif`
            );
        } else if (interaction.options.getSubcommand() === 'pat') {
            client.userStatistics.ensure(target.id, client.defaults.USER_STATISTICS);
            client.userStatistics.inc(target.id, 'pats');
            await interaction.reply(`**Pat!**\n<@${interaction.user.id}> pats <@${target.id}> on the head~!`);
        } else if (interaction.options.getSubcommand() === 'hug') {
            client.userStatistics.ensure(target.id, client.defaults.USER_STATISTICS);
            client.userStatistics.inc(target.id, 'hugs');
            await interaction.reply(`**HUG!**\n<@${interaction.user.id}> huggles <@${target.id}> tightly.`);
        } else {
            await interaction.reply('Something went wrong; notify a developer!');
            throw new Error('Bad affection subcommand.');
        }
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        return builder
            .addSubcommand((s) =>
                s
                    .setName('boop')
                    .setDescription('Boop someone!')
                    .addUserOption((t) => t.setName('target').setDescription('The user to boop.').setRequired(true))
            )
            .addSubcommand((s) =>
                s
                    .setName('pat')
                    .setDescription('Pat someone on the head!')
                    .addUserOption((t) => t.setName('target').setDescription('The user to pat.').setRequired(true))
            )
            .addSubcommand((s) =>
                s
                    .setName('hug')
                    .setDescription('Hug someone!')
                    .addUserOption((t) => t.setName('target').setDescription('The user to hug.').setRequired(true))
            );
    }
}
