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
import { exec, ExecException } from 'child_process';
import { MessageEmbed } from 'discord.js';
import chalk from 'chalk';
import type { Client, Message } from 'discord.js';
import type Logger from '@lib/interfaces/Logger';
import { readBuffer, clearBuffer, getMaxBufferSize, changeMaxBufferSize, LogMode, readBufferOfType } from '@root/log';
import type CommandConfig from '@lib/interfaces/commands/CommandConfig';

// Main
export async function run(client: Client, message: Message, args: string[], log: Logger): Promise<void> {
    // Safety check
    if (message.author.id !== client.config.ownerID) {
        console.log('e', `User ${message.author.tag} tried to use "admin", and the command filter didn't stop them!`);
        message.reply("You don't have permission to do that!");
        return;
    }

    args[0] = args[0]?.toLowerCase();

    log('i', `Admin command executed by ${message.author.tag}: ${args[0]}`);

    if (args[0] === 'restart' || args[0] === 're') {
        log('w', `${message.author.tag} has triggered a restart!`);
        // restart bot
        await message.reply('Alright, restarting...');
        client.restartData.set('serverId', message.guild?.id);
        client.restartData.set('channelId', message.channel.id);
        client.restartData.set('messageId', message.id);
        client.restartData.set('time', Date.now());
        client.restartData.set('wasRestarted', true);
        log('w', 'Goodbye!');
        log('w', 'Exiting with code 9 (RESTART)');
        process.exit(9);
    } else if (args[0] === 'branch' || args[0] === 'checkout') {
        if (!args[1]) {
            message.reply('What branch did you want to switch to?');
            return;
        }

        let embed = new MessageEmbed()
            .setTitle('Branch Switch')
            .setDescription(`Please wait.. Switching to \`${args[1]}\`...`)
            .addField('Status', `\`$ git branch ${args[1]}\``);

        const m = await message.reply({ embeds: [embed] });

        exec(`git checkout ${args[1]}`, (error: ExecException | null, stdout: string, stderr: string) => {
            embed = new MessageEmbed()
                .setTitle(`Branch Switch [${stderr.startsWith('Switched') ? 'Complete' : 'Failed'}]`)
                .setDescription(stderr.startsWith('Switched') ? `Switched to branch ${args[1]}` : 'Failed to switch to branch. (Does it exist?)');

            if (stderr) embed.addField('Log', `\`\`\`\n${stderr ?? '<none>'}${stdout !== '' ? `\n${stdout}` : ''}\n\`\`\``);

            m.edit({ embeds: [embed] });
        });
    } else if (args[0] === 'update' || args[0] === 'up') {
        const embed = new MessageEmbed().setTitle('Update').setDescription('Updating the bot... This may take a while...');

        function l(mode: LogMode, message: string): void {
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
                                        `To apply the update, run \`${client.config.prefix}restart\`.\nYou may want to run \`${client.config.prefix}admin exec git stash apply\` to re-instate unsaved changes.`
                                    );

                                m.edit({ embeds: [embed] });

                                l('i', 'Update completed!');
                            }
                        });
                    }
                });
            }
        });
    } else if (args[0] === 'eval' || args[0] === 'e') {
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

        const embed = new MessageEmbed().setFooter({ text: `Eval command executed by ${message.author.username}` }).setTimestamp();
        let response;
        let e = false;
        try {
            if (code.includes('await') && !message.content.includes('\n')) code = `( async () => {return ${code}})()`;
            else if (code.includes('await') && message.content.includes('\n')) code = `( async () => {${code}})()`;

            // eslint-disable-next-line no-eval
            response = await eval(code);
            if (typeof response !== 'string') response = require('util').inspect(response, { depth: 3 });
        } catch (err) {
            e = true;
            response = (<Error>err).toString();
            const Linter = require('eslint').Linter;
            const linter = new Linter();
            const lint = linter.verify(code, {
                env: { commonjs: true, es2021: true, node: true },
                extends: 'eslint:recommended',
                parserOptions: { ecmaVersion: 12 }
            });
            const error = lint.find((e: any) => e.fatal);
            if (error) {
                const line = code.split('\n')[error.line - 1];
                const match = line.slice(error.column - 1).match(/\w+/i);
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
            .setDescription(`\`\`\`${response.substr(0, 1018)}\`\`\``);
        if (length >= 1025 && !silent) {
            // dont do this on silent items
            log(e ? 'e' : 'i', `An eval command executed by ${message.author.username}'s response was too long (${length}/2048).`);
            log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
            log(e ? 'e' : 'i', 'Output:');
            response.split('\n').forEach((b: string) => {
                log(e ? 'e' : 'i', b);
            });
            embed.addField('Note:', `The response was too long with a length of \`${length}/1024\` characters. it was logged to the console. `);
        } else if (!silent) {
            // use different log for silent items
            log(e ? 'e' : 'i', `An eval command has been executed by ${message.author.username}!`);
            log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
            log(e ? 'e' : 'i', 'Output:');
            response.split('\n').forEach((b: string) => {
                log(e ? 'e' : 'i', b);
            });
        }

        if (!silent)
            try {
                message.reply({ embeds: [embed] });
            } catch (e) {
                log('e', e as string);
            }
        else {
            message.delete().catch(() => {
                // delete silent msg
                log('e', 'Failed to delete command message with silent eval!');
            });
            log(e ? 'e' : 'i', 'Silent eval output:');
            log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
            log(e ? 'e' : 'i', 'Output:');
            response.split('\n').forEach((b: string) => {
                log(e ? 'e' : 'i', b);
            });
        }
    } else if (args[0] === 'exec' || args[0] === 'ex') {
        args.shift();

        let silent = false;
        if ((args[0] as string) === '-s') {
            args.shift();
            silent = true;
        }
        const code: string = args.join(' ');

        const embed = new MessageEmbed().setFooter({ text: `Exec command executed by ${message.author.username}` }).setTimestamp();
        let e = false;

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
                log(e ? 'e' : 'i', `An exec command executed by ${message.author.username}'s response was too long (${parsed.length}/1024).`);
                log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                log(e ? 'e' : 'i', 'Output:');
                if (error) {
                    log(e ? 'e' : 'i', 'ExecError:');
                    error
                        .toString()
                        .split('\n')
                        .forEach((b: string) => {
                            log(e ? 'e' : 'i', b);
                        });
                }
                if (stderr) {
                    log(e ? 'e' : 'i', 'STDERR:');
                    stderr.split('\n').forEach((b: string) => {
                        log(e ? 'e' : 'i', b);
                    });
                }
                if (stdout) {
                    log(e ? 'e' : 'i', 'STDOUT:');
                    stdout.split('\n').forEach((b: string) => {
                        log(e ? 'e' : 'i', b);
                    });
                }
                embed.addField(
                    'Note:',
                    `The response was too long with a length of \`${parsed.length}/1024\` characters. It was logged to the console.`
                );
            } else if (!silent) {
                // use different log for silent items
                log(e ? 'e' : 'i', `An exec command has been executed by ${message.author.username}!`);
                log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                log(e ? 'e' : 'i', 'Output:');
                if (error) {
                    log(e ? 'e' : 'i', 'ExecError:');
                    error
                        .toString()
                        .split('\n')
                        .forEach((b: string) => {
                            log(e ? 'e' : 'i', b);
                        });
                }
                if (stderr) {
                    log(e ? 'e' : 'i', 'STDERR:');
                    stderr.split('\n').forEach((b: string) => {
                        log(e ? 'e' : 'i', b);
                    });
                }
                if (stdout) {
                    log(e ? 'e' : 'i', 'STDOUT:');
                    stdout.split('\n').forEach((b: string) => {
                        log(e ? 'e' : 'i', b);
                    });
                }
            }

            if (!silent)
                try {
                    message.reply({ embeds: [embed] });
                } catch (e) {
                    log('e', e as string);
                }
            else {
                message.delete().catch(() => {
                    // delete silent msg
                    log('e', 'Failed to delete command message with silent exec!');
                });
                log(e ? 'e' : 'i', 'Silent exec output:');
                log(e ? 'e' : 'i', `Error: ${e ? 'Yes' : 'No'}`);
                log(e ? 'e' : 'i', 'Output:');
                parsed.split('\n').forEach((b: string) => {
                    log(e ? 'e' : 'i', b);
                });
            }
        });
    } else if (args[0] === 'reload' || args[0] === 'rl') {
        log('i', 'Reloading commands...');
        const pre = Date.now();
        const msg = await message.channel.send('Reloading all commands...');
        client.commands.loadCommands();
        const post = Date.now();
        msg.edit(`Reloaded all commands in ${post - pre}ms (${(post - pre) / 1000} seconds)!`);
    } else if (args[0] === 'clearlogbuffer' || args[0] === 'clb') {
        log('i', 'Clearing log buffer...');
        const len = readBuffer().length;
        clearBuffer();
        message.reply(`Cleared log buffer of ${len} entries.`);
    } else if (args[0] === 'setmaxbuffer' || args[0] === 'smb') {
        log('i', `Setting log buffer max to ${parseInt(args[1])} entries...`);
        if (isNaN(parseInt(args[1]))) {
            log('w', 'not a number');
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
            log('e', e);
        }
        return;
    } else {
        message.reply(`Please specify a command to execute. Here are the available commands:
\`admin help\`: Shows this message
\`admin (re|restart)\`: Restarts the bot
\`admin (checkout|branch)\`: Change the Git branch we are running from
\`admin (up|update)\`: Run a software update.
\`admin (e|eval)\`: Evaluates a code snippet.
\`admin (ex|exec)\`: Runs a Bash command.
\`admin (rl|reload)\`: Reload commands from the config.
\`admin (clb|clearlogbuffer)\`: Clear the log buffer (use when low on memory)
\`admin (smb|setmaxbuffer)\`: Set the maximum number of log entries to store in memory. **This is not persistent.**
\`admin (rdl|readlog)\`: Read the log buffer. \`readlog\` takes two argument: the type (__v__erbose, __i__nfo, __w__arning, or __e__rror) to read. Then the # of messages to fetch (defaults to 15).`);
        return;
    }
}

// Config
export const config: CommandConfig = {
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
    restrict: { users: [] } // owner only
};
