/*
 * Lexi -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022, 2023  0xLogN
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

import type { CacheType, SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type LexiCommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LNHaste from '#lib/LNHaste';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

export default class HasteCommand extends LexiSlashCommand {
    public getConfig(): LexiCommandConfig {
        return {
            name: 'haste',
            description: "Uploads text to LogN's hastebin server.",
            enabled: true,
            restrict: false
        };
    }

    public async run(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const text = await interaction.options.getString('text')!;
        const ephemeral = (await interaction.options.getBoolean('ephemeral')) ?? false;

        await interaction.deferReply({ ephemeral });
        await interaction.editReply(await LNHaste(text));
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        return builder
            .addStringOption((option) => option.setName('text').setDescription('The text to upload.').setRequired(true))
            .addBooleanOption((option) =>
                option.setName('ephemeral').setDescription('Whether or not to reply in an ephemeral message.').setRequired(false)
            );
    }
}
