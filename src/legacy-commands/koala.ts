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
import type { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import LegacyLexiCommand from '#lib/structures/LegacyLexiCommand';

interface KoalaData {
    link: string;
}

export default class KoalaCommand extends LegacyLexiCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'koala',
            category: 'fun',
            description: 'Get a koala picture!',
            usage: '',
            enabled: true,
            aliases: [], // command aliases to load

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(message: Message<boolean>): Promise<void> {
        const msg = await message.reply('Fetching a koala picture...');
        const body = (await fetch('https://some-random-api.ml/img/koala').then((res) => res.json())) as KoalaData;
        const embed = new MessageEmbed()
            .setTitle(`Koala for ${message.author.username}`)
            .setImage(body.link)
            .setTimestamp(Date.now())
            .setColor('RANDOM');
        msg.delete();
        message.reply({ embeds: [embed] });
    }
}
