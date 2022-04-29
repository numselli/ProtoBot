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

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';
import { formatRow } from '#lib/utils/formatTrackerRow';
import EmoteCounterData from '#lib/interfaces/db/EmoteCounterData';

// The number of users that should be displayed on the leaderboard at a
// given time.
const CUTOFF = 10;

export default class CatCommand extends LexiSlashCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'leaderboard',
            description: 'Get an ECT leaderboard (# of times someone said uwu, owo, etc).',
            enabled: true,

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        const { client } = this;
        if (interaction.options.getSubcommand() !== 'uwus' && interaction.options.getSubcommand() !== 'owos' && interaction.options.getSubcommand() !== 'tildes') {
            await interaction.reply('The bot is probably broken. Notify a developer. The issue was: Invalid subcommand in leaderboard.');
            throw new Error('This should never happen.');
        }

        const buf: string[] = [];
        let sorted: (readonly [string, number])[] = [];
        switch (interaction.options.getSubcommand()) {
            case 'uwus':
                buf.push('```adoc\n===== UWU LEADERBOARD =====');
                sorted = client.emoteCounterTrackers.map((values, id) => [id, values.uwus] as const).sort((a, b) => b[1] - a[1]);
                break;
            case 'owos':
                buf.push('```adoc\n===== OWO LEADERBOARD =====');
                sorted = client.emoteCounterTrackers.map((values, id) => [id, values.owos] as const).sort((a, b) => b[1] - a[1]);
                break;
            case 'tildes':
                buf.push('```adoc\n===== TILDE LEADERBOARD =====');
                sorted = client.emoteCounterTrackers.map((values, id) => [id, values.tildes] as const).sort((a, b) => b[1] - a[1]);
                break;
            default: throw new Error('This should never happen.');
        }

        let placed = false
        for (let i = 0; i < sorted.length && i < CUTOFF; i++) {
            const [id] = sorted[i];
            if (id === interaction.user.id) placed = true;

            // eslint-disable-next-line no-await-in-loop
            const user = await client.users.fetch(id).catch(() => null);
            buf.push(formatRow(interaction.options.getSubcommand() as keyof EmoteCounterData, i, user, client));
        }

        if (!placed) {
            const index = sorted.findIndex(([id]) => id === interaction.user.id);
            if (index !== -1) buf.push('...', formatRow('uwus', index, interaction.user, client));
        }

        buf.push('```');
        await interaction.reply(buf.join('\n'));
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        const cfg = this.getConfig();
        return builder
            .setName(cfg.name)
            .setDescription(cfg.description)
            .addSubcommand((sub) => sub.setName('uwus').setDescription('Check who said uwu the most!'))
            .addSubcommand((sub) => sub.setName('owos').setDescription('Check who said owo the most!'))
            .addSubcommand((sub) => sub.setName('tildes').setDescription('Check who ended their message in a tilde the most!'));
    }
}
