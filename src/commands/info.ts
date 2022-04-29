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
import { MessageEmbed } from 'discord.js';

import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type LexiCommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import type LexiClient from '#lib/structures/LexiClient';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';

function fireStats(userID: string, interaction: CommandInteraction, client: LexiClient): void {
    const uData = client.userStatistics.get(userID)!;
    const ETD = client.emoteCounterTrackers.get(userID)!;
    const embed = new MessageEmbed()
        .setTitle(`User info for ${userID}`)
        .addField('Hugs', uData.hugs.toString())
        .addField('Boops', uData.boops.toString())
        .addField('Pats', uData.pats.toString())
        .addField('uwus', ETD.uwus.toString())
        .addField('owos', ETD.owos.toString())
        .addField('Tildes', ETD.tildes.toString())
        .setColor(client.publicConfig.colors.color1);
    interaction.reply({ embeds: [embed] });
}

export default class InfoCommand extends LexiSlashCommand {
    public getConfig(): LexiCommandConfig {
        return {
            name: 'info',
            description: "Get a user's stats!",
            enabled: true,

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }
    public async run(interaction: CommandInteraction): Promise<void> {
        const { client, log } = this;
        const userID = interaction.options.getUser('target')!.id;

        if (!client.userStatistics.get(userID)) {
            client.users
                .fetch(userID)
                .then((user) => {
                    client.userStatistics.ensure(user.id, client.defaults.USER_STATISTICS);
                    fireStats(userID, interaction, client);
                })
                .catch(() => {
                    log.info(`Unknown user ${userID}!`);
                    interaction.reply('Unknown user!');
                    return;
                });
            return;
        } else fireStats(userID, interaction, client);
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        const cfg = this.getConfig();
        return builder
            .setName(cfg.name)
            .setDescription(cfg.description)
            .addUserOption(i => i.setName('target').setDescription('The user to get info for.').setRequired(true));
    }
}
