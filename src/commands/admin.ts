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
import type { ExecException } from 'child_process';
import { exec } from 'child_process';
import type { CommandInteraction } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { Linter } from 'eslint';
import * as util from 'util';

import { getInteractionPermissions } from '#lib/getInteractionPermissions';
import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import { Permissions } from '#lib/Permissions';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';
import type { LogMode } from '#root/log';
import { changeMaxBufferSize, clearBuffer, getMaxBufferSize, readBuffer, readBufferOfType } from '#root/log';

export default class AdminCommand extends LexiSlashCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'admin',
            description: 'Manage the bot internals.',
            enabled: true,
            restrict: Permissions.BOT_ADMINISTRATOR
        };
    }

    public async run(interaction: CommandInteraction): Promise<void> {
        const { client, log } = this;

        /**
         * Compatibility layer for the Version 2 log & Version 1 loggers. This is a temporary solution until
         * I find a better way to do this - LogN.
         */
        function legacyLog(mode: LogMode, message: unknown) {
            if (mode === 'i') log.info(message);
            else if (mode === 'w') log.warn(message);
            else if (mode === 'e') log.error(message);
            else if (mode === 'v') log.verbose(message);
        }

        log.info(`Admin command executed by ${interaction.user.tag}`);

        const subcommand = interaction.options.getSubcommand();
        // TODO: Actually check the group. /admin read would be the same as /admin log read.
        if (subcommand === 'restart') {
            log.warn(`${interaction.user.tag} has triggered a restart!`);
            // restart bot
            await interaction.reply('Alright, restarting...');
            const m = await interaction.fetchReply();
            client.restartData.set('serverId', interaction.guild!.id);
            client.restartData.set('channelId', interaction.channel!.id);
            client.restartData.set('messageId', m.id);
            client.restartData.set('time', Date.now());
            client.restartData.set('wasRestarted', true);
            log.warn('Goodbye!');
            log.warn('Exiting with code 9 (RESTART)');
            process.exit(9);
        } else if (subcommand === 'eval') {
            if (getInteractionPermissions(client, log, interaction) < Permissions.BOT_SUPER_ADMIN) {
                log.warn(`User ${interaction.user.tag} tried to use "admin eval", but they don't have permission!`);
                await interaction.reply({ content: 'Nah, that command is for the bot owner only!', ephemeral: true });
                return;
            }

            const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
            let code = interaction.options.getString('code')!;

            await interaction.deferReply({ ephemeral });

            const embed = new MessageEmbed()
                .setFooter({ text: `Eval command executed by ${interaction.user.username}` })
                .setTimestamp()
                .setColor(client.publicConfig.colors.color3);
            let response;
            let e = false;
            try {
                if (code.includes('await') && !code.includes('\n')) code = `( async () => {return ${code}})()`;
                else if (code.includes('await') && code.includes('\n')) code = `( async () => {${code}})()`;

                // eslint-disable-next-line no-eval
                response = await eval(code);
                if (typeof response !== 'string') response = util.inspect(response, { depth: 3 });
            } catch (err) {
                e = true;
                response = (err as Error).toString();
                const linter = new Linter();
                const lint = linter.verify(code, {
                    env: { commonjs: true, es2021: true, node: true },
                    extends: 'eslint:recommended',
                    parserOptions: { ecmaVersion: 12 }
                });
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const error = lint.find((e: { fatal: boolean }) => e.fatal);
                if (error) {
                    const line = code.split('\n')[error.line - 1];
                    const match = /\w+/i.exec(line.slice(error.column - 1));
                    const length = match ? match[0].length : 1;
                    response = `${line}
    ${' '.repeat(error.column - 1)}${'^'.repeat(length)}
    [${error.line}:${error.column}] ${error.message} `;
                }
            }
            const length = `\`\`\`${response}\`\`\``.length;
            embed
                .setTitle(e ? '**Error**' : '**Success**')
                .setColor(e ? 'RED' : 'GREEN')
                .setDescription(`\`\`\`${response.substring(0, 1018)}\`\`\``);
            if (length >= 1025) {
                legacyLog(e ? 'e' : 'i', `An eval command executed by ${interaction.user.username}'s response was too long (${length}/2048).`);
                legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                legacyLog(e ? 'e' : 'i', 'Output:');
                response.split('\n').forEach((b: string) => {
                    legacyLog(e ? 'e' : 'i', b);
                });
                embed.addField('Note:', `The response was too long with a length of \`${length}/1024\` characters. it was logged to the console. `);
            }

            try {
                await interaction.editReply({ embeds: [embed] });
            } catch (e) {
                legacyLog('e', e as string);
            }
        } else if (subcommand === 'exec') {
            if (getInteractionPermissions(client, log, interaction) < Permissions.BOT_SUPER_ADMIN) {
                log.warn(`User ${interaction.user.tag} tried to use "admin exec", but they don't have permission!`);
                await interaction.reply({ content: 'Nah, that command is for the bot owner only!', ephemeral: true });
                return;
            }

            const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
            const code = interaction.options.getString('code')!;

            await interaction.deferReply({ ephemeral });

            let e = false;
            const embed = new MessageEmbed()
                .setFooter({ text: `Exec command executed by ${interaction.user.username}` })
                .setTimestamp()
                .setColor(client.publicConfig.colors.color3);

            exec(code, (error: ExecException | null, stdout: string, stderr: string) => {
                if (error || stderr) e = true;

                if (stderr) embed.addField('STDERR', `\`\`\`${stderr.substring(0, 1018)}\`\`\``);

                if (stdout) embed.addField('STDOUT', `\`\`\`${stdout.substring(0, 1018)}\`\`\``);

                if (error) embed.addField('ExecError', `\`\`\`${error.toString().substring(0, 1018)}\`\`\``);

                const parsed = [(error ?? { toString: () => '' }).toString(), stderr, stdout].reduce((a, b) => (a.length > b.length ? a : b));

                embed
                    .setTitle(e ? '**Error**' : '**Success**')
                    .setColor(e ? 'RED' : 'GREEN')
                    .setDescription('Here is your output!');

                if (parsed.length >= 1025) {
                    legacyLog(
                        e ? 'e' : 'i',
                        `An exec command executed by ${interaction.user.username}'s response was too long (${parsed.length}/1024).`
                    );
                    legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                    legacyLog(e ? 'e' : 'i', 'Output:');
                    if (error) {
                        legacyLog(e ? 'e' : 'i', 'ExecError:');
                        error
                            .toString()
                            .split('\n')
                            .forEach((b: string) => {
                                legacyLog(e ? 'e' : 'i', b);
                            });
                    }
                    if (stderr) {
                        legacyLog(e ? 'e' : 'i', 'STDERR:');
                        stderr.split('\n').forEach((b: string) => {
                            legacyLog(e ? 'e' : 'i', b);
                        });
                    }
                    if (stdout) {
                        legacyLog(e ? 'e' : 'i', 'STDOUT:');
                        stdout.split('\n').forEach((b: string) => {
                            legacyLog(e ? 'e' : 'i', b);
                        });
                    }
                    embed.addField(
                        'Note:',
                        `The response was too long with a length of \`${parsed.length}/1024\` characters. It was logged to the console.`
                    );
                }

                try {
                    interaction.editReply({ embeds: [embed] });
                } catch (e) {
                    legacyLog('e', e as string);
                }
            });
        } else if (subcommand === 'clear') {
            // /admin log clear
            log.info('Clearing log buffer...');
            const len = readBuffer().length;
            clearBuffer();
            await interaction.reply(`Cleared log buffer of ${len} entries.`);
        } else if (subcommand === 'set_max_size') {
            // /admin log set_max_size <n>
            log.info(`Setting log buffer max to ${interaction.options.getNumber('new')} entries...`);
            const old = getMaxBufferSize();
            changeMaxBufferSize(interaction.options.getNumber('new')!);
            await interaction.reply(`Changed maximum buffer size from ${old} to ${interaction.options.getNumber('new')} entries.`);
        } else if (subcommand === 'read') {
            // /admin log read
            await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? false });
            let mode = interaction.options.getString('mode')! as LogMode;
            switch (mode.toLowerCase()) {
                case 'v':
                case 'verbose':
                    mode = 'v';
                    break;
                case 'i':
                case 'info':
                    mode = 'i';
                    break;
                case 'w':
                case 'warning':
                    mode = 'w';
                    break;
                case 'e':
                case 'error':
                    mode = 'e';
                    break;
                default:
                    if (mode === 'i') break;
                    await interaction.editReply({ content: 'Unknown modespec.' });
                    return;
            }
            let buffer = readBufferOfType(mode);
            const count = interaction.options.getNumber('count') ?? 15;
            buffer = buffer.slice(count * -1);

            if (buffer.length === 0) {
                await interaction.editReply('No entries found.');
                return;
            }

            let mtext = '```';
            buffer.forEach((b) => {
                mtext += `\n${b[2]}`;
            });
            mtext += '```';
            if (mtext.length > 2000) {
                await interaction.editReply(`Too many logs were generated. Total length was ${mtext.length} characters, 2000 is the maximum.`);
                return;
            }

            await interaction.editReply(mtext);

            return;
        }
    }

    public buildSlashCommand(builder: SlashCommandBuilder): JSONAbleSlashCommandBody {
        return builder
            .addSubcommand((sub) => sub.setName('restart').setDescription('Restarts the bot.'))
            .addSubcommand((sub) =>
                sub
                    .setName('eval')
                    .setDescription('Run a JS code snippet.')
                    .addStringOption((o) => o.setName('code').setDescription('The code to run.').setRequired(true))
                    .addBooleanOption((o) => o.setName('ephemeral').setDescription('Respond with an ephemeral message?'))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('exec')
                    .setDescription('Run a shell command.')
                    .addStringOption((o) => o.setName('code').setDescription('The code to run.').setRequired(true))
                    .addBooleanOption((o) => o.setName('ephemeral').setDescription('Respond with an ephemeral message?'))
            )
            .addSubcommandGroup((g) =>
                g
                    .setName('log')
                    .setDescription('Logging management commands.')
                    .addSubcommand((s) => s.setName('clear').setDescription('Clear the log buffer.'))
                    .addSubcommand((s) =>
                        s
                            .setName('set_max_size')
                            .setDescription('Set the maximum log buffer size.')
                            .addNumberOption((o) => o.setName('new').setDescription('The new maximum size.').setRequired(true))
                    )
                    .addSubcommand((s) =>
                        s
                            .setName('read')
                            .setDescription('Read some logs!')
                            .addStringOption((opt) =>
                                opt
                                    .setName('mode')
                                    .setDescription('The type of logs to filter.')
                                    .addChoices(
                                        { name: 'Verbose', value: 'v' },
                                        { name: 'Info', value: 'i' },
                                        { name: 'Warning', value: 'w' },
                                        { name: 'Error', value: 'e' }
                                    )
                                    .setRequired(true)
                            )
                            .addNumberOption((opt) => opt.setName('count').setDescription('The maximum amount of logs to read.'))
                            .addBooleanOption((opt) => opt.setName('ephemeral').setDescription('Respond with an ephemeral message?'))
                    )
            );
    }
}
