/**
 * ProtoBot -- A Discord furry bot
 * Copyright (C) 2020, 2021  BadBoyHaloCat
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
import discord from 'discord.js';
import type { Client, Message } from 'discord.js';
import chalk from 'chalk';
import { exec, ExecException } from 'child_process';
import type Logger from '@lib/interfaces/Logger';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    // Safety check
    if (message.author.id !== client.config.ownerID) {
        log('w', `User ${message.author.tag} tried to use "update"!`);
        message.reply("You don't have permission to do that!");
        return;
    }

    log('i', `User "${message.author.tag}" has triggered an update!`);

    const embed: discord.MessageEmbed = new discord.MessageEmbed().setTitle('Update').setDescription('Updating the bot... This may take a while...');

    function l(mode: 'v' | 'i' | 'w' | 'e', message: string): void {
        return log(mode, `${chalk.green('[')}${chalk.green.bold('Updater')}${chalk.green(']')} ${message}`);
    }

    l('i', 'Getting git status...');

    const m = await message.reply({ embeds: [embed] });

    exec('git status', (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
            l('e', `Failed to update: ${error}`);
            m.edit(`Failed to update: ${error}`);
        } else {
            l('i', 'Got git status!');
            embed.addField('Git Status', `\`\`\`\n$ git status\n\n${stdout === '' ? stderr : stdout}\n\`\`\``);

            l('i', 'Stashing files...');
            exec('git stash', (error2: ExecException | null, stdout2: string, stderr2: string) => {
                if (error2) {
                    l('e', `Failed to update: ${error2}`);
                    m.edit(`Failed to update: ${error2}`);
                } else {
                    l('i', 'Added files!');
                    embed.addField('Git Stash Result', `\`\`\`\n$ git stash\n\n${stdout2 === '' ? stderr2 : stdout2}\n\`\`\``);

                    l('i', 'Syncing...');

                    exec('git fetch && git pull --no-rebase && git push', (error4: ExecException | null, stderr4: string, stdout4: string) => {
                        if (error4) {
                            l('e', `Failed to update: ${error4}`);
                            m.edit(`Failed to update: ${error4}`);
                        } else {
                            l('i', 'Synced!');
                            embed
                                .addField(
                                    'Git Sync (fetch -> pull -> push) Result',
                                    `\`\`\`\n$ git fetch && git pull --no-rebase && git push\n\n${stdout4 === '' ? stderr4 : stdout4}\n\`\`\``
                                )
                                .addField('Status', '**Complete.**')
                                .addField(
                                    'Restart to apply changes',
                                    `To apply the update, run \`${client.config.prefixes[0]}restart\`.\nYou may want to run \`${client.config.prefixes[0]}exec git stash apply\` to re-instate unsaved changes.}`
                                );

                            m.edit({ embeds: [embed] });

                            l('i', 'Update completed!');
                        }
                    });
                }
            });
        }
    });
}

// Config
export const config = {
    name: 'update',
    description: 'Update the bot!',
    enabled: true,
    aliases: ['upd'],

    // To restrict the command, change the "false" to the following
    // format:
    //
    // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
    restrict: {} // owner only
};
