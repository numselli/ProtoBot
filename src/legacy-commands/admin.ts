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
import type { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { Linter } from 'eslint';
import * as util from 'util';

import { getPermissionsForUser } from '#lib/getPermissionsForUser';
import type CommandConfig from '#lib/interfaces/commands/LegacyLexiCommandConfig';
import { Permissions } from '#lib/Permissions';
import LegacyLexiCommand from '#lib/structures/LegacyLexiCommand';
import type { LogMode } from '#root/log';
import { changeMaxBufferSize, clearBuffer, getMaxBufferSize, readBuffer, readBufferOfType } from '#root/log';

export default class AdminCommand extends LegacyLexiCommand {
    public getConfig(): CommandConfig {
        return {
            name: 'admin',
            category: 'owner',
            usage: '[subcommand] [...arguments]',
            description: 'Manage the bot internals.',
            enabled: true,
            aliases: ['a', 'manage', 'system', 'sys'], // command aliases to load

            // To restrict the command, change the "false" to the following
            // format:
            //
            // restrict: { users: [ "array", "of", "authorized", "user", "IDs" ] }
            restrict: Permissions.BOT_ADMINISTRATOR
        };
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const { client, log } = this;

        // TODO: Find another way to handle this.
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

        args[0] = args[0]?.toLowerCase();

        log.info(`Admin command executed by ${message.author.tag}: ${args[0]}`);

        if (args[0] === 'restart' || args[0] === 're') {
            log.warn(`${message.author.tag} has triggered a restart!`);
            // restart bot
            await message.reply('Alright, restarting...');
            client.restartData.set('serverId', message.guild?.id);
            client.restartData.set('channelId', message.channel.id);
            client.restartData.set('messageId', message.id);
            client.restartData.set('time', Date.now());
            client.restartData.set('wasRestarted', true);
            log.warn('Goodbye!');
            log.warn('Exiting with code 9 (RESTART)');
            process.exit(9);
        } else if (args[0] === 'eval' || args[0] === 'e') {
            if (getPermissionsForUser(client, log, message) < Permissions.BOT_SUPER_ADMIN) {
                log.warn(`User ${message.author.tag} tried to use "admin eval", but they don't have permission!`);
                message.reply('Nah, that command is for the bot owner only!');
                return;
            }

            args.shift();
            /**
             * Credit to WilsonTheWolf for some of this eval code!
             */
            let silent = false;
            if ((args[0] as string) === '-s') {
                args.shift();
                silent = true;
            }
            let code: string = args.join(' ');

            const embed = new MessageEmbed()
                .setFooter({ text: `Eval command executed by ${message.author.username}` })
                .setTimestamp()
                .setColor(client.publicConfig.colors.color3);
            let response;
            let e = false;
            try {
                if (code.includes('await') && !message.content.includes('\n')) code = `( async () => {return ${code}})()`;
                else if (code.includes('await') && message.content.includes('\n')) code = `( async () => {${code}})()`;

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
            if (length >= 1025 && !silent) {
                // dont do this on silent items
                legacyLog(e ? 'e' : 'i', `An eval command executed by ${message.author.username}'s response was too long (${length}/2048).`);
                legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                legacyLog(e ? 'e' : 'i', 'Output:');
                response.split('\n').forEach((b: string) => {
                    legacyLog(e ? 'e' : 'i', b);
                });
                embed.addField('Note:', `The response was too long with a length of \`${length}/1024\` characters. it was logged to the console. `);
            } else if (!silent) {
                // use different log for silent items
                legacyLog(e ? 'e' : 'i', `An eval command has been executed by ${message.author.username}!`);
                legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                legacyLog(e ? 'e' : 'i', 'Output:');
                response.split('\n').forEach((b: string) => {
                    legacyLog(e ? 'e' : 'i', b);
                });
            }

            if (!silent)
                try {
                    message.reply({ embeds: [embed] });
                } catch (e) {
                    legacyLog('e', e as string);
                }
            else {
                message.delete().catch(() => {
                    // delete silent msg
                    legacyLog('e', 'Failed to delete command message with silent eval!');
                });
                legacyLog(e ? 'e' : 'i', 'Silent eval output:');
                legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                legacyLog(e ? 'e' : 'i', 'Output:');
                response.split('\n').forEach((b: string) => {
                    legacyLog(e ? 'e' : 'i', b);
                });
            }
        } else if (args[0] === 'exec' || args[0] === 'ex') {
            if (getPermissionsForUser(client, log, message) < Permissions.BOT_SUPER_ADMIN) {
                log.warn(`User ${message.author.tag} tried to use "admin exec", but they don't have permission!`);
                message.reply('Nah, that command is for the bot owner only!');
                return;
            }
            args.shift();

            let silent = false;
            if ((args[0] as string) === '-s') {
                args.shift();
                silent = true;
            }
            const code: string = args.join(' ');

            let e = false;
            const embed = new MessageEmbed()
                .setFooter({ text: `Exec command executed by ${message.author.username}` })
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

                if (parsed.length >= 1025 && !silent) {
                    // dont do this on silent items
                    legacyLog(
                        e ? 'e' : 'i',
                        `An exec command executed by ${message.author.username}'s response was too long (${parsed.length}/1024).`
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
                } else if (!silent) {
                    // use different log for silent items
                    legacyLog(e ? 'e' : 'i', `An exec command has been executed by ${message.author.username}!`);
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
                }

                if (!silent)
                    try {
                        message.reply({ embeds: [embed] });
                    } catch (e) {
                        legacyLog('e', e as string);
                    }
                else {
                    message.delete().catch(() => {
                        // delete silent msg
                        legacyLog('e', 'Failed to delete command message with silent exec!');
                    });
                    legacyLog(e ? 'e' : 'i', 'Silent exec output:');
                    legacyLog(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                    legacyLog(e ? 'e' : 'i', 'Output:');
                    parsed.split('\n').forEach((b: string) => {
                        legacyLog(e ? 'e' : 'i', b);
                    });
                }
            });
        } else if (args[0] === 'reload' || args[0] === 'rl') {
            log.info('Reloading commands...');
            const pre = Date.now();
            const msg = await message.channel.send('Reloading all commands...');
            client.commands.LEGACY_loadCommands();
            const post = Date.now();
            msg.edit(`Reloaded all commands in ${post - pre}ms (${(post - pre) / 1000} seconds)!`);
        } else if (args[0] === 'clearlogbuffer' || args[0] === 'clb') {
            log.info('Clearing log buffer...');
            const len = readBuffer().length;
            clearBuffer();
            message.reply(`Cleared log buffer of ${len} entries.`);
        } else if (args[0] === 'setmaxbuffer' || args[0] === 'smb') {
            log.info(`Setting log buffer max to ${parseInt(args[1])} entries...`);
            if (isNaN(parseInt(args[1]))) {
                log.warn('not a number');
                message.reply('Not a number!');
                return;
            }
            const old = getMaxBufferSize();
            changeMaxBufferSize(parseInt(args[1]));
            message.reply(`Changed maximum buffer size from ${old} to ${parseInt(args[1])} entries.`);
        } else if (args[0] === 'readlog' || args[0] === 'rdl') {
            let mode: LogMode = 'w';
            if (!args[1]) {
                message.reply('No TYPE specified, defaulting to `i`.');
                mode = 'i';
            }
            switch ((args[1] ?? '').toLowerCase()) {
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
                    message.reply('Unknown modespec.');
                    return;
            }
            let buffer = readBufferOfType(mode);
            if (parseInt(args[2])) {
                message.channel.send(`Read ${buffer.length} entries of type \`${mode}\` from buffer. Shortening to ${parseInt(args[2])} entries.`);
                buffer = buffer.slice(parseInt(args[2]) * -1);
            } else if (buffer.length > 15) {
                message.channel.send(`${buffer.length} entries found. Shortening to 15.`);
                buffer = buffer.slice(-15);
            }

            if (buffer.length === 0) {
                message.reply('No entries found.');
                return;
            }

            let mtext = '```';
            buffer.forEach((b) => {
                mtext += `\n${b[2]}`;
            });
            mtext += '```';
            try {
                await message.channel.send(mtext);
            } catch (e) {
                message.channel.send(
                    'Failed to send message! Probably too long. Report this to yourself, LogN~! (located at commands/admin.ts rdl try-catch ONSEND)'
                );
                legacyLog('e', e);
            }
            return;
        } else {
            message.reply(`Please specify a command to execute. Here are the available commands:
    \`admin help\`: Shows this message
    \`admin (re|restart)\`: Restarts the bot
    \`admin (e|eval)\`: Evaluates a code snippet. **SuperAdmins only**
    \`admin (ex|exec)\`: Runs a Bash command. **SuperAdmins only**
    \`admin (rl|reload)\`: Reload commands from the config.
    \`admin (clb|clearlogbuffer)\`: Clear the log buffer (use when low on memory)
    \`admin (smb|setmaxbuffer)\`: Set the maximum number of log entries to store in memory. **This is not persistent.**
    \`admin (rdl|readlog)\`: Read the log buffer. \`readlog\` takes two argument: the type (__v__erbose, __i__nfo, __w__arning, or __e__rror) to read. Then the # of messages to fetch (defaults to 15).`);
            return;
        }
    }
}
