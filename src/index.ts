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
const client = new Client({
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_INVITES,
        discord.Intents.FLAGS.GUILD_MESSAGES, // We may need to apply for this intent at verification
        discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.DIRECT_MESSAGES,
        discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]
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

    // The root function used to load all of the command files.
    function loadCmds(): void {
        // Define our own local version of the log() function to be used within this function, to show it is
        // the command loading handler.
        function l(type: 'v' | 'i' | 'w' | 'e', message: any) {
            log(type, `${chalk.yellow('[')}${chalk.yellow.bold('CMDLOAD')}${chalk.yellow(']')} ${message}`);
        }
        l('i', 'Beginning initial command load...');

        // Read the root directory of the commands.
        fs.readdir(client.config.dirs.commands, (err, files) => {
            if (err) {
                // Something went wrong. err = an Error object
                l('e', `Failed to read directory ${client.config.dirs.commands}:`);
                l('e', err);
            } else
                files.forEach((path) => {
                    // Ensure that what we are reading is a core JavaScript compiled file.
                    if (path.endsWith('.js')) {
                        // Check that this file does not contain capitalized letters in it's names.
                        // This is a violation. Logged as: 'CommandCasedWarning'
                        if (path.replace('.js', '').toLowerCase() !== path.replace('.js', '')) {
                            l('w', `CommandCasedWarning: Command at ${path} has a name with a capital letter!`);
                            l('w', `Will be loaded as "${path.replace('.js', '').toLowerCase()}"!`);
                            // Normalize the path. This should never be needed.
                            path = path.toLowerCase();
                        }

                        // The command data is loaded from the path.
                        const commandData = <Command>(
                            require(client.config.dirs.commands.endsWith('/')
                                ? client.config.dirs.commands + path
                                : `${client.config.dirs.commands}/${path}`)
                        );
                        const cmdName = path.replace('.js', ''); // Set the command's name to the path without the extension.
                        l('v', `Loading command "${cmdName}"...`); //
                        client.commandsConfig.set(cmdName, commandData.config); // Set the command configuration into the command map.
                        client.commands.set(cmdName, commandData); // Import the command into the main commands object.
                        // Load aliases into the refs along with the base command
                        l('v', `Loading command aliases for ${cmdName}...`);
                        l('v', 'Loaded base alias!');
                        client.commandsRefs.set(cmdName, cmdName); // The command's name itself will always be an alias, as
                        // the code that handles aliases is not very well written.
                        (commandData.config.aliases ?? []).forEach((alias) => {
                            l('v', `Loaded alias ${alias}!`);
                            client.commandsRefs.set(alias, cmdName); // Set the alias into the command referencing Map.
                        });
                        l('i', `Finished loading command "${cmdName}"!`);
                    } else if (path.endsWith('.map')) return;
                    // Ignore source maps
                    // THIS IS A VIOLATION AND SHOULD NEVER THROW; We will not kill the process however.
                    else l('w', `File in commands dir with unknown extension: ${path}`);
                });
        });
    }
    loadCmds(); // Execute the massive function block above.

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

    // Status
    // We assume the main prefix is always the first in the array.
    client.user?.setActivity(`${client.config.prefixes[0]}about | Written for furries, by furries!`, { type: 'PLAYING' });

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
        client.restartData.set('wasRestarted', false); // TODO: Maybe check that there is no way for this to
        //       not be set, as if it is set true at start we
        //       always will nag the dev.
    }
    // A clean start
    else log('i', 'Not restarted.');
});

// The most important part.
// *** HANDLING MESSAGES ***
// message will be a discord.Message object with the standard properties.
// -- THIS REQUIRES THE GUILDMESSAGES PRIVILEGED INTENT
client.on('messageCreate', (message: discord.Message) => {
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
        message.reply('Hey there! I do not accept DMs. Use me in a server.');
        return;
    }
    // Execute each hook from the database.
    client.hooks.forEach((hookData) => {
        log('i', `${chalk.green('[')}${chalk.green.bold('HookRunner')}${chalk.green(']')} Running hook ${hookData.config.name}!`);
        hookData.run(client, message, log);
    });
    let msgIsCommand = false;
    let prefixLen = 0;
    let prefixUsed;
    for (const prefix of client.config.prefixes)
        if (message.content.toLowerCase().startsWith(prefix)) {
            msgIsCommand = true;
            prefixLen = prefix.length;
            prefixUsed = prefix;
            break;
        }

    // if it's a command, we handle it.
    if (msgIsCommand) {
        const args: string[] = message.content.slice(prefixLen).split(/ +/g);
        let command = args.shift()?.toLowerCase() ?? '';

        // quit if the command couldn't be fetched
        if (!command) return;

        // verbose info
        log('v', `Running command "${command}" for "${message.author.tag}" with args "${args.join(' ')}"!`);
        log(
            'v',
            `Command found at: ${message.guild?.name ?? 'unknown'} (${message.guild?.id ?? 'unknown'}) => #${
                <string>message.channel?.name ?? '#unknown'
            } (${message.channel?.id ?? 'unknown'}) => ${message.id}`
        );

        log('v', 'Resolving alias...');
        command = client.commandsRefs.get(command) ?? '';
        log('v', `Alias resolved to "${command}"!`);

        const commandData: Command | undefined = client.commands.get(command);
        if (!commandData) {
            // exit
            log('i', `Failed to find command "${command}", exiting handler.`);
            return;
        }

        const { run: commandExec, config: commandConfig } = commandData;
        // Now we check for specific things to prevent the command from running
        // in it's configuration.
        if (!commandConfig.enabled) {
            log('i', 'Command is disabled!');
            message.reply('That command is disabled!');
            return;
        }
        if (
            commandConfig.restrict &&
            commandConfig.restrict.users &&
            !commandConfig.restrict.users.includes(message.author.id) &&
            message.author.id !== client.config.ownerID
        ) {
            // User isn't authorised; the user is either not whitelisted to use the command and/or they're not an owner.
            log('i', 'User unauthorized!');
            message.reply("You aren't authorized to do that!");
            return;
        }
        commandExec(client, message, args, log);
    }
});

// Handle rate limits
client.on('rateLimit', (data) => {
    log('w', 'Got hit with a ratelimit!');
    log('w', `Ratelimited when performing ${data.method} ${data.path}`);
    log('w', `API route was ${data.route} and limit hit was ${data.limit}/${data.timeout}ms (${data.timeout / 1000} seconds).`);
    log('w', 'Operations have been paused until the ratelimit is lifted!');
});

// When the process exits, wrap up.
process.on('exit', (code) => {
    client.destroy(); // Kill the client
    // NOTE: you can't log here
});

// If we get an uncaught exception, close ASAP.
process.on('uncaughtException', async (error) => {
    log('e', 'Killing client...', true);
    client.destroy();
    log('e', 'Client killed.', true);
    log('e', 'Closing databases...', true);
    client.closeDatabases();
    log('e', 'Closed databases.', true);
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
