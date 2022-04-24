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

import { Message, MessageEmbed } from 'discord.js';

import type CommandConfig from '#lib/interfaces/commands/CommandConfig';
import Command from '#lib/structures/Command';

export default class FursonaCommand extends Command {
    public getConfig(): CommandConfig {
        return {
            name: 'fursona',
            category: 'furry',
            usage: '[subcommand] [...args]',
            description: 'See/edit your fursona details!',
            enabled: true,
            aliases: ['sona'],

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: false
        };
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const { client, log } = this;
        // Get their fursona, PLS GIB I WANT AAAA >w<

        switch (args[0]) {
            case 'set':
                log.info('Setting fursona!');
                if (!args[1]) {
                    const prefix = client.guildData.get(message.guild!.id, 'prefix');
                    log.info('Showing set help!');
                    message.reply(
                        `\`\`\`adoc\n===== FURSONA HELP =====\n${prefix}fursona set name <name> :: Set your fursona's name\n${prefix}fursona set bio <bio>   :: Set your fursona's bio\n${prefix}fursona set type <type> :: Set your fursona's breed/type (but not in people lol)\n\`\`\``
                    );
                    return;
                }

                switch (args[1].toLowerCase()) {
                    case 'name':
                        if (!args[2]) {
                            const temp = client.fursonas.ensure(message.author.id, {});
                            if ('name' in temp) {
                                delete temp.name;
                                message.reply('Deleted value.');
                                client.fursonas.set(message.author.id, temp);
                                return;
                            }
                            client.fursonas.set(message.author.id, temp);
                            message.reply('You need to provide a value!');
                            return;
                        }
                        client.fursonas.ensure(message.author.id, {});
                        client.fursonas.set(message.author.id, args.slice(2).join(' '), 'name');
                        message.reply('Set!');
                        break;
                    case 'bio':
                        if (!args[2]) {
                            const temp = client.fursonas.ensure(message.author.id, {});
                            if ('bio' in temp) {
                                delete temp.bio;
                                message.reply('Deleted value.');
                                client.fursonas.set(message.author.id, temp);
                                return;
                            }
                            client.fursonas.set(message.author.id, temp);
                            message.reply('You need to provide a value!');
                            return;
                        }
                        client.fursonas.ensure(message.author.id, {});
                        client.fursonas.set(message.author.id, args.slice(2).join(' '), 'bio');
                        message.reply('Set!');
                        break;
                    case 'type':
                        if (!args[2]) {
                            const temp = client.fursonas.ensure(message.author.id, {});
                            if ('type' in temp) {
                                delete temp.type;
                                message.reply('Deleted value.');
                                client.fursonas.set(message.author.id, temp);
                                return;
                            }
                            client.fursonas.set(message.author.id, temp);
                            message.reply('You need to provide a value!');
                            return;
                        }
                        client.fursonas.ensure(message.author.id, {});
                        client.fursonas.set(message.author.id, args.slice(2).join(' '), 'type');
                        message.reply('Set!');
                        break;
                    default:
                        message.reply('Unknown option! Try `fursona set`.');
                        break;
                }
                break;
            default:
                // If they haven't set one...
                const fursona = client.fursonas.get(message.author.id);
                if (!fursona) {
                    log.info('No fursona for user!');
                    message.reply("You haven't set a fursona yet! To do this, run the command `fursona set`.");
                    return;
                }

                // They have one!
                log.info('Displaying fursona!');
                const embed = new MessageEmbed()
                    .setTitle('Fursona')
                    .setDescription('Here is your current fursona information.')
                    .setColor(client.publicConfig.colors.color4);

                embed.addField('Name', fursona.name || '<unset>', true);
                embed.addField('Bio', fursona.bio || '<unset>', true);
                embed.addField('Type', fursona.type || '<unset>');

                message.reply({ embeds: [embed] });
                break;
        }
    }
}
