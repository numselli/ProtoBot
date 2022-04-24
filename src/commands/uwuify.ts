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

import type CommandConfig from '@lib/interfaces/commands/CommandConfig';
import Command from '@lib/structures/Command';
import type { Message } from 'discord.js';
import Uwuifier from 'uwuifier';

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

export default class UwuifyCommand extends Command {
    public getConfig(): CommandConfig {
        return {
            name: 'uwuify',
            category: 'fun',
            usage: '[-i] [text]',
            description:
                'Converts all of your text to UwU-talk!\nIntense mode available with `-i` flag: `~uwuify -i text`\nPowered by [Uwuifier](https://github.com/Schotsl/Uwuifier)',
            enabled: true,
            aliases: ['uwu'],

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(message: Message<boolean>, args: string[]): Promise<void> {
        let intense = false;
        if (args.length === 0) {
            message.reply('**Error:** No text provided!');
            return;
        }

        if (args[0] === '-i') {
            intense = true;
            args.shift();
        }

        const msg: string = uwuify.uwuifySentence(args.join(' '));
        message.channel.send(intense ? msg.replace(/u/gi, 'UwU').replace(/o/gi, 'OwO') : msg.substring(0, 2000));
    }
}
