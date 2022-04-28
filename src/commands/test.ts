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

import type { SlashCommandBuilder } from '@discordjs/builders';
import type { CommandInteraction } from 'discord.js';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type LexiCommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

export default class BoopCommand extends LexiSlashCommand {
    public getConfig(): LexiCommandConfig {
        return {
            name: 'test',
            description: 'A testy command.',
            enabled: true,

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        const { log } = this;

        log.info('The testy was tested.');
        await interaction.reply('Pong! Test worked.');
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        const cfg = this.getConfig();
        return builder.setName(cfg.name).setDescription(cfg.description);
    }
}
