/**
 * ProtoBot -- A Discord furry bot
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

// Import the moduleAlias module. This is used to allow importing of module
// aliases, such as @lib (to the lib folder) and @root (to the root of the
// source)
import moduleAlias from 'module-alias';

moduleAlias.addAliases({
    '@lib': __dirname + '/lib', // Library files, such as core modules and clients.
    '@root': __dirname + '/' // For direct access to uncompiled source.
});

// Import source-map-support and register it to allow better visibility of
// error locations as shown in the TS default source maps.
import 'source-map-support/register';

// Modules
import * as fs from 'fs'; // Filesystem access
import chalk from 'chalk'; // Coloring for CLI - FIXME: update to v5 when TS is updated
import Client from '@lib/Client'; // The custom client files
import discord from 'discord.js'; // <<< Discord!
import type Command from '@lib/interfaces/Command'; // For command typing

// FIXME: Remove me later, this is a bad idea.
process.setMaxListeners(13);

// Import the primary log function from the CWD.
import log from './log';

// Verify the currently running commit...
log('i', 'Verifying we were started via the start script...');
if (!process.env.PROTOBOT_STARTSH_COMMIT) {
    log('e', 'Environment variable PROTOBOT_STARTSH_COMMIT is not set!', true);
    log('w', "If you are seeing this message, it means you are running the bot's script directly.");
    log('w', 'This is not recommended, and may cause unexpected behavior.');
    log('w', 'After multiple bug reports of people using an invalid environment (like this one),');
    log('w', 'the developer team has decided that direct execution should be disabled.');
    log('w', 'Please use the start script instead.');
    log('w', 'Reference issue #463 for more information.');
    log('e', 'We were not started via the start script! Exiting (code 1)...', true);
    process.exit(1);
}

// Initialize a Client instance, and provide the Discord intent flags.
const client = new Client(log, {
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_INVITES,
        discord.Intents.FLAGS.GUILD_MESSAGES, // We may need to apply for this intent at verification
        discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.DIRECT_MESSAGES,
        discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['CHANNEL']
});

// When the client is ready...
client.on('ready', async () => {
    // Count the total user counts up. We do this by getting the total user count
    // for each server and remove ourselves from it...
    const userCountsPerGuild = client.guilds.cache.map((g) => g.memberCount - 1);
    let userTotal = 0;
    // ...and iterate through them to increment our user total...
    userCountsPerGuild.forEach((item) => (userTotal += item));
    // ...and get the average guild-user ratio.
    const userAvg = userTotal / userCountsPerGuild.length;
    // prettier-ignore
    (() => {
        log('i', ' _______  ______   _______ _________');
        log('i', '(  ____ )(  ___ \\ (  ___  )\\__   __/');
        log('i', '| (    )|| (   ) )| (   ) |   ) (  '); 
        log('i', '| (____)|| (__/ / | |   | |   | |  '); 
        log('i', '|  _____)|  __ (  | |   | |   | |  '); 
        log('i', '| (      | (  \\ \\ | |   | |   | |  '); 
        log('i', '| )      | )___) )| (___) |   | |  '); 
        log('i', '|/       |/ \\___/ (_______)   )_(  '); 
    })();
    log('i', 'Ready!');
    log('i', `Running ProtoBot on commit ${process.env.PROTOBOT_STARTSH_COMMIT}.`);
    if (process.env.PROTOBOT_STARTSH_DIRTYSOURCE) log('w', 'Uncommitted changes present (dirty source tree)');

    if (process.env.PRODUCTION) log('i', 'Running in production mode. Verbose logging is disabled.');
    else log('i', 'Running in development mode. Verbose logging is enabled.');

    // A lot of chalk prefixes to show the counts. A better way to handle this?
    // Whoever wrote this (myself) needs some mental help.
    log('i', `Username: ${chalk.red(client.user?.tag) ?? '(error: client.user is undefined)'}`);
    log('i', `In ${chalk.red(client.guilds.cache.size)} guilds!`);
    log('i', `With ${chalk.red(client.channels.cache.size)} channels!`);
    log('i', `Total ${chalk.red(userTotal)} members, excluding myself!`);
    log('i', `Average user count over all guilds: ${chalk.red(Math.round(userAvg))}`);
    log('i', `Loaded ${chalk.red(client.config.prefixes.length)} prefixes!`);

    client.commands.loadCommands();

    // Same thing, load the hook files.
    function loadHooks(): void {
        // Consult loadCmds for most of this.
        function l(type: 'v' | 'i' | 'w' | 'e', message: any) {
            log(type, `${chalk.yellow('[')}${chalk.yellow.bold('HOOKLOAD')}${chalk.yellow(']')} ${message}`);
        }
        l('i', 'Beginning initial hook load...');
        fs.readdir(client.config.dirs.hooks, (err, files) => {
            if (err) {
                l('e', `Failed to read directory ${client.config.dirs.hooks}:`);
                l('e', err);
            } else
                files.forEach((path: string) => {
                    if (path.endsWith('.js')) {
                        // normal load, but in this case we import into the hook Map.
                        const hookData = require(client.config.dirs.hooks.endsWith('/')
                            ? client.config.dirs.hooks + path
                            : `${client.config.dirs.hooks}/${path}`);
                        const hookName = path.replace('.js', '');
                        l('v', `Loading hook "${hookName}"...`);
                        client.hooks.set(hookName, hookData);
                        l('i', `Finished loading hook "${hookName}"!`);
                    } else if (path.endsWith('.map')) return;
                    // unknown ext
                    else l('w', `File in hooks dir with unknown extension: ${path}`);
                });
        });
    }
    loadHooks(); // Execute that massive thing again.

    // Status handling code
    // We assume the main prefix is always the first in the array.
    const allStatuses: ['PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | 'COMPETING', string][] = [
        // First index is the initial one.
        ['PLAYING', `${client.config.prefixes[0]}about | Written for furries, by furries!`],
        ['PLAYING', `${client.config.prefixes[0]}about | uwu`],
        ['PLAYING', `${client.config.prefixes[0]}about | ah yes, much furry`],
        ['PLAYING', `${client.config.prefixes[0]}about | I am not an uwu cat! - one of the developers, probably.`]
    ];
    setInterval(() => {
        const status = allStatuses[Math.floor(Math.random() * allStatuses.length)];
        log('i', `Change status: ${status[1]} (${status[0]})`);
        client.user?.setActivity(status[1], { type: status[0] });
    }, 10 * 60 * 1000); // Every 10 minutes.
    log('i', 'Set status.');
    client.user?.setActivity(allStatuses[0][1], { type: allStatuses[0][0] });

    // If we were restarted, based on the restartData Map, send the RestartTimer message to
    // the channel we were restarted in.
    log('i', 'Checking if we were restarted...');
    if (client.restartData.get('wasRestarted')) {
        log('i', 'We have restarted. Sending message...');
        const guild = client.guilds.cache.get(<string>client.restartData.get('serverId')); // Fetch the server we restarted in...
        const channel = <discord.TextChannel>await guild?.channels.cache.get(<string>client.restartData.get('channelId')); // ...and get the channel...
        const message = await channel?.messages.fetch(<string>client.restartData.get('messageId')); // ...and finally the message.
        await message.reply(
            `Done! Restart complete in ${Date.now() - <number>client.restartData.get('time')}ms (${
                (Date.now() - <number>client.restartData.get('time')) / 1000
            } seconds).`
        );
        client.restartData.set('wasRestarted', false);
    }
    // A clean start
    else log('i', 'Not restarted.');
});

// The most important part.
// *** HANDLING MESSAGES ***
// message will be a discord.Message object with the standard properties.
// -- THIS REQUIRES THE GUILDMESSAGES PRIVILEGED INTENT
client.on('messageCreate', async (message) => {
    // Log the message content if we are in verbose mode.
    log(
        'v',
        chalk`{yellow [}{yellow.bold MSG}{yellow ]} ` +
            chalk`{blue.bold @${message.author.tag}} ` +
            chalk`{green.bold #${(<discord.TextChannel>message.channel).name ?? '<DM>'}} {green in ${message.guild?.name ?? '<DM>'}}: ` +
            message.content
    );

    // Let's (theoretically) say this person is brand new to us. We need
    // to use .ensure() to make sure they exist in the databases. This
    // does nothing if they are already in the DBs. If they aren't, we
    // will add them with the default values as defined in
    // client.defaults.
    client.ustats.ensure(message.author.id, client.defaults.USER_STATS);
    client.uconfs.ensure(message.author.id, client.defaults.USER_CONFS);
    client.cooldowns.ensure(message.author.id, client.defaults.COOLDOWNS);
    // If this is a bot, return to prevent looping.
    if (message.author.bot) return;

    // ...but if it's a DM, clarify it to the user.
    if (message.channel.type === 'DM') {
        log('i', 'Discouraged DM.');
        message.reply('Hey there! I do not accept DMs. Use me in a server.');
        return;
    }
    // Execute each hook from the database.
    client.hooks.forEach((hookData) => {
        log('v', `${chalk.green('[')}${chalk.green.bold('HookRunner')}${chalk.green(']')} Running hook ${hookData.config.name}!`);
        hookData.run(client, message, log);
    });
    let msgIsCommand = false;
    let prefixLen = 0;
    for (const prefix of client.config.prefixes)
        if (message.content.toLowerCase().startsWith(prefix)) {
            msgIsCommand = true;
            prefixLen = prefix.length;
            break;
        }

    // if it's a command, we handle it.
    if (msgIsCommand) {
        const args: string[] = message.content.slice(prefixLen).split(/ +/g);
        const command = args.shift()?.toLowerCase() ?? '';

        try {
            await client.commands.run(command, args, message, client);
        } catch (e) {
            log('e', 'Command failed!', true);
            log('e', e, true);
            message.reply('Something went wrong! Notify a developer.');
        }
    }
});

// Handle rate limits
client.on('rateLimit', (data) => {
    log('w', 'Got hit with a ratelimit!');
    log('w', `Ratelimited when performing ${data.method} ${data.path}`);
    log('w', `API route was ${data.route} and limit hit was ${data.limit}/${data.timeout}ms (${data.timeout / 1000} seconds).`);
    log('w', 'Operations have been paused until the ratelimit is lifted!');
});

// Handle SIGTERM and SIGINT
async function handleInterrupt(): Promise<void> {
    log('w', 'Got SIGTERM or SIGINT, shutting down...');
    log('w', 'Sync logs...');
    await log('CLOSE_STREAMS');
    process.exit();
}
process.on('SIGTERM', handleInterrupt);
process.on('SIGINT', handleInterrupt);

// When the process exits, wrap up.
process.on('exit', (code) => {
    log('w', 'Kill client...');
    client.destroy(); // Kill the client
    // NOTE: you can't log here
});

// If we get an uncaught exception, close ASAP.
process.on('uncaughtException', async (error) => {
    log('e', 'Killing client...', true);
    client.destroy();
    log('e', 'Client killed.', true);
    log('e', 'An uncaught exception occured!', true);
    log('e', `Error thrown was:`, true);
    error.stack?.split('\n').forEach((item) => {
        log('e', `${item}`, true);
    });
    log('e', 'Stack trace dump:', true);
    let stack = new Error().stack?.split('\n');
    stack?.shift();
    if (!stack) stack = [];

    stack.forEach((item) => {
        log('e', `${item}`, true);
    });
    log('e', 'Process exiting.', true);
    log('e', 'Exit code 5.', true);
    log('e', 'Goodbye!', true);
    await log('CLOSE_STREAMS');
    process.exit(5);
});

// Log in
client.login(client.config.token);
