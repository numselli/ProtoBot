/*
 * ProtoBot -- A Discord bot for furries and non-furs alike!
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

// Modules
import type { Client, Message } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';
import sleep from '@lib/sleep';
import { MessageEmbed } from 'discord.js';
import type CommandConfig from '@lib/interfaces/CommandConfig';

interface CutieData {
    username: string;
    tag: string;
    id: string;
}

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    const cuties: CutieData[] = [
        { username: 'Foxley Affection', tag: '6969', id: '701951512410062858' },
        { username: 'boa', tag: '0771', id: '251105781867347969' },
        { username: 'AlphaSerpentis', tag: '3203', id: '216037365829992448' },
        { username: 'A Fox', tag: '3696', id: '649394695570718730' },
        { username: 'Ayanari', tag: '4420', id: '814303392020692994' }
    ];

    const m = await message.reply(`**Detecting cuties for <@${message.author.id}>...**\nThis may take a while.`);

    const embed = new MessageEmbed().setTitle('Cuties list').setDescription(`I have found **${cuties.length}** cuties!`);
    for (const cutie of cuties) embed.addField(`${cutie.username}#${cutie.tag}`, `User ID: \`${cutie.id}\``);

    setTimeout(() => {
        m.edit({ embeds: [embed] });
    }, 3000);
}

// Config
export const config: CommandConfig = {
    name: 'cuties',
    category: 'fun',
    usage: '',
    description: 'See a list of cuties!',
    enabled: true,
    aliases: ['foxley', 'cutie'], // command aliases to load

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: false
};
