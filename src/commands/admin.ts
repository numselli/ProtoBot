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

import type { ExecException } from 'child_process';
import { exec } from 'child_process';
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ActivityType } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Linter } from 'eslint';
import { inspect } from 'util';

import { getInteractionPermissions } from '#lib/getInteractionPermissions';
import type JSONAbleSlashCommandBody from '#lib/interfaces/commands/JSONAbleSlashCommandBody';
import type CommandConfig from '#lib/interfaces/commands/LexiCommandConfig';
import { Permissions } from '#lib/Permissions';
import LexiSlashCommand from '#lib/structures/LexiSlashCommand';
import type { LogMode } from '#root/log';
import { changeMaxBufferSize, clearBuffer, getMaxBufferSize, readBuffer, readBufferOfType } from '#root/log';
import { resetForcedStatus, setForcedStatus } from '#root/utils/onready/status';

export default class AdminCommand extends LexiSlashCommand {
    public getConfig(): CommandConfig {
        return { name: 'admin', description: 'Manage the bot internals.', enabled: true, restrict: Permissions.BOT_ADMINISTRATOR };
    }

    public async run(interaction: ChatInputCommandInteraction): Promise<void> {
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

        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (group === null)
            if (subcommand === 'restart') {
                log.warn(`${interaction.user.tag} has triggered a restart!`);
                // restart bot
                await interaction.reply('Alright, restarting...');
                const repliedMessage = await interaction.fetchReply();
                client.restartData.set('serverId', interaction.guild!.id);
                client.restartData.set('channelId', interaction.channel!.id);
                client.restartData.set('messageId', repliedMessage.id);
                client.restartData.set('time', Date.now());
                client.restartData.set('wasRestarted', true);
                log.warn('Goodbye!');
                log.warn('Exiting with code 9 (RESTART)');
                process.exit(9);
            } else if (subcommand === 'eval') {
                if (getInteractionPermissions(client, log, interaction) < Permissions.BOT_SUPER_ADMIN) {
                    log.warn(`User ${interaction.user.tag} tried to use "admin eval", but they don't have permission!`);
                    log.info(`Attempted code was ${interaction.options.getString('code')}`);
                    await interaction.reply({ content: 'Nah, that command is for the bot owner only!', ephemeral: true });
                    return;
                }

                const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
                let code = interaction.options.getString('code')!;

                await interaction.deferReply({ ephemeral });

                const embed = new EmbedBuilder()
                    .setFooter({ text: `Eval command executed by ${interaction.user.username}` })
                    .setTimestamp()
                    .setColor(client.publicConfig.colors.color3);
                let response;
                let didError = false;
                try {
                    if (code.includes('await') && !code.includes('\n')) code = `( async () => {return ${code}})()`;
                    else if (code.includes('await') && code.includes('\n')) code = `( async () => {${code}})()`;

                    // eslint-disable-next-line no-eval
                    response = await eval(code);
                    if (typeof response !== 'string') response = inspect(response, { depth: 3 });
                } catch (err) {
                    didError = true;
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
                    .setTitle(didError ? '**Error**' : '**Success**')
                    .setColor(didError ? 'Red' : 'Green')
                    .setDescription(`\`\`\`${response.substring(0, 1018)}\`\`\``);
                if (length >= 1025) {
                    legacyLog(
                        didError ? 'e' : 'i',
                        `An eval command executed by ${interaction.user.username}'s response was too long (${length}/2048).`
                    );
                    legacyLog(didError ? 'e' : 'i', `Error: ${didError ? 'Yes' : 'No'}`);
                    legacyLog(didError ? 'e' : 'i', 'Output:');
                    response.split('\n').forEach((b: string) => {
                        legacyLog(didError ? 'e' : 'i', b);
                    });
                    embed.addFields([
                        {
                            name: 'Note:',
                            value: `The response was too long with a length of \`${length}/1024\` characters. it was logged to the console.`
                        }
                    ]);
                }

                log.info(`${ephemeral ? 'Ephemeral eval' : 'Eval'} command executed by ${interaction.user.tag}`);
                log.info(`Code: ${code}`);
                log.info(`Response: ${response}`);

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

                let didError = false;
                const embed = new EmbedBuilder()
                    .setFooter({ text: `Exec command executed by ${interaction.user.username}` })
                    .setTimestamp()
                    .setColor(client.publicConfig.colors.color3);

                exec(code, (error: ExecException | null, stdout: string, stderr: string) => {
                    if (error || stderr) didError = true;

                    if (stderr) embed.addFields([{ name: 'STDERR', value: `\`\`\`${stderr.substring(0, 1018)}\`\`\`` }]);

                    if (stdout) embed.addFields([{ name: 'STDOUT', value: `\`\`\`${stdout.substring(0, 1018)}\`\`\`` }]);

                    if (error) embed.addFields([{ name: 'ExecError', value: `\`\`\`${error.toString().substring(0, 1018)}\`\`\`` }]);

                    const parsed = [(error ?? { toString: () => '' }).toString(), stderr, stdout].reduce((a, b) => (a.length > b.length ? a : b));

                    embed
                        .setTitle(didError ? '**Error**' : '**Success**')
                        .setColor(didError ? 'Red' : 'Green')
                        .setDescription('Here is your output!');

                    if (parsed.length >= 1025) {
                        legacyLog(
                            didError ? 'e' : 'i',
                            `An exec command executed by ${interaction.user.username}'s response was too long (${parsed.length}/1024).`
                        );
                        legacyLog(didError ? 'e' : 'i', `Error: ${didError ? 'Yes' : 'No'}`);
                        legacyLog(didError ? 'e' : 'i', 'Output:');
                        if (error) {
                            legacyLog(didError ? 'e' : 'i', 'ExecError:');
                            error
                                .toString()
                                .split('\n')
                                .forEach((b: string) => {
                                    legacyLog(didError ? 'e' : 'i', b);
                                });
                        }
                        if (stderr) {
                            legacyLog(didError ? 'e' : 'i', 'STDERR:');
                            stderr.split('\n').forEach((b: string) => {
                                legacyLog(didError ? 'e' : 'i', b);
                            });
                        }
                        if (stdout) {
                            legacyLog(didError ? 'e' : 'i', 'STDOUT:');
                            stdout.split('\n').forEach((b: string) => {
                                legacyLog(didError ? 'e' : 'i', b);
                            });
                        }
                        embed.addFields([
                            {
                                name: 'Note:',
                                value: `The response was too long with a length of \`${parsed.length}/1024\` characters. It was logged to the console.`
                            }
                        ]);
                    }

                    log.info(`${ephemeral ? 'Ephemeral exec' : 'exec'} command executed by ${interaction.user.tag}`);
                    log.info(`Code: ${code}`);
                    if (error) log.error(`ExecError: ${error.toString()}`);
                    if (stderr) log.error(`STDERR: ${stderr}`);
                    if (stdout) log.info(`STDOUT: ${stdout}`);

                    try {
                        interaction.editReply({ embeds: [embed] });
                    } catch (e) {
                        legacyLog('e', e as string);
                    }
                });
            } else {
                await interaction.reply('This should never happen. Report this as a bug.');
                throw new Error('invalid subcommand of admin <no group>');
            }
        else if (group === 'log')
            if (subcommand === 'clear') {
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
            } else {
                await interaction.reply('This should never happen. Report this as a bug.');
                throw new Error('invalid subcommand of admin log');
            }
        else if (group === 'status')
            if (subcommand === 'set') {
                const type = interaction.options.getString('type') as keyof typeof ActivityType;
                const string = interaction.options.getString('string')!;
                setForcedStatus(client, log, [ActivityType[type], string]);
                await interaction.reply(`Successfully set status to "${ActivityType[type]} **${string}**".`);
            } else if (subcommand === 'reset') {
                resetForcedStatus(client, log);
                await interaction.reply('Status has been reset.');
            } else {
                await interaction.reply('This should never happen. Report this as a bug.');
                throw new Error('invalid subcommand of admin status');
            }
        else {
            await interaction.reply('This should never happen. Report this as a bug.');
            throw new Error('invalid group of admin');
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
                    .setName('status')
                    .setDescription('Manage the status & presence of the bot.')
                    .addSubcommand((s) =>
                        s
                            .setName('set')
                            .setDescription('Set the presence of the bot.')
                            .addStringOption((o) =>
                                o
                                    .setName('type')
                                    .setDescription('The type of presence to use.')
                                    .addChoices(
                                        { name: 'Playing', value: 'Playing' },
                                        { name: 'Listening', value: 'Listening' },
                                        { name: 'Watching', value: 'Watching' }
                                    )
                                    .setRequired(true)
                            )
                            .addStringOption((o) => o.setName('string').setDescription('The message to set the presence to.').setRequired(true))
                    )
                    .addSubcommand((s) => s.setName('reset').setDescription('Removes a custom presence and selects a new random one.'))
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
