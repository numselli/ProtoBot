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

import type { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import Uwuifier from 'uwuifier';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

const uwuify: Uwuifier = new Uwuifier();
uwuify.actions = [
    '*blushes*',
    '*whispers to self*',
    '*cries*',
    '*screams*',
    '*sweats*',
    '*twerks*',
    '*runs away*',
    '*screeches*',
    '*walks away*',
    '*looks at you*',
    '*starts twerking*',
    '*huggles tightly*',
    '*boops your nose*'
];

export default class UwuifyCommand extends LexiSlashCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'uwuify',
            description: 'Converts all of your text to UwU-talk!',
            enabled: true,
            restrict: false
        };
    }

    public async run(interaction: ChatInputCommandInteraction): Promise<void> {
        const intense = interaction.options.getBoolean('intense') ?? false;

        const msg: string = uwuify.uwuifySentence(interaction.options.getString('text')!);
        await interaction.reply(intense ? msg.replace(/u/gi, 'UwU').replace(/o/gi, 'OwO') : msg.substring(0, 2000));
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        return builder
            .addStringOption((i) => i.setName('text').setDescription('The text to uwuify.').setRequired(true))
            .addBooleanOption((i) => i.setName('intense').setDescription('If true, u is replaced with UwU and o is replaced with OwO.'));
    }
}
