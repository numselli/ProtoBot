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

import type CommandConfig from '#lib/interfaces/commands/CommandConfig';
import LexiCommand from '#lib/structures/LexiCommand';

interface FoxData {
    image: string;
    link: string;
}

export default class FoxCommand extends LexiCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'fox',
            category: 'fun',
            usage: '',
            description: 'Get a cute fox picture!',
            enabled: true,
            aliases: ['foxxo'], // command aliases to load

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(message: Message): Promise<void> {
        const msg = await message.reply('Fetching a fox picture...');
        const body = (await fetch('https://randomfox.ca/floof/').then((res) => res.json())) as FoxData;
        const embed = new MessageEmbed()
            .setTitle(`Fox for ${message.author.username}`)
            .setImage(body.image)
            .setTimestamp(Date.now())
            .setDescription(`[Link](${body.link})`)
            .setColor('RANDOM');
        msg.edit({ embeds: [embed] });
    }
}
