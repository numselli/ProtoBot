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

// Import source-map-support and register it to allow better visibility of
// error locations as shown in the TS default source maps.
import 'source-map-support/register';

// Modules
import chalk from 'chalk'; // Coloring for CLI
import Client from '@lib/Client'; // The custom client files
import discord from 'discord.js'; // <<< Discord!
import * as ready from '@lib/onready/index';

// Import the primary log function from the CWD.
import log from './log';

// Verify the currently running commit...
log('v', 'Verifying we were started via the start script...');
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
    ready.init(client, log);
    client.commands.loadCommands();
    ready.loadHooks(client, log);
    ready.setStatus(client, log);
    ready.handleRestart(client, log);
});

// The most important part.
// *** HANDLING MESSAGES ***
// message will be a discord.Message object with the standard properties.
// -- THIS REQUIRES THE GUILDMESSAGES PRIVILEGED INTENT
client.on('messageCreate', async (message) => {
    // Log the message content if we are in verbose mode.
    log(
        'v',
        `${chalk.yellow('[')}${chalk.yellow.bold('MSG')}${chalk.yellow(']')} ${chalk.blue.bold('@' + message.author.tag)} ${chalk.green.bold(
            '#' + (message.channel as discord.TextChannel).name ?? '<DM>'
        )}: ${message.content}`
    );

    // Let's (theoretically) say this person is brand new to us. We need
    // to use .ensure() to make sure they exist in the databases. This
    // does nothing if they are already in the DBs. If they aren't, we
    // will add them with the default values as defined in
    // client.defaults.
    client.userStatistics.ensure(message.author.id, client.defaults.USER_STATISTICS);
    client.userConfiguration.ensure(message.author.id, client.defaults.USER_CONFIGURATION);
    client.cooldowns.ensure(message.author.id, client.defaults.COOLDOWNS);
    // If this is a bot, return to prevent looping.
    if (message.author.bot) return;

    // ...but if it's a DM, clarify it to the user.
    if (message.channel.type === 'DM') {
        log('i', `Discouraged DM from ${message.author.tag}`);
        message.reply('Hey there! I do not accept DMs. Use me in a server.');
        return;
    }
    // Execute each hook from the database.
    client.hooks.forEach((hookData) => {
        log('v', `Running hook ${hookData.config.name} for ${message.author.tag}!`);
        hookData.run(client, message, log);
    });
    let msgIsCommand = false;
    let prefixLen = 0;
    const prefix = client.guildData.get(message.guild!.id, 'prefix')!;
    const lowercasedMessageContent = message.content.toLowerCase();

    if (lowercasedMessageContent.startsWith(prefix)) {
        prefixLen = prefix.length;
        msgIsCommand = true;
    } else if (lowercasedMessageContent.startsWith(`<@${client.user!.id}>`) || lowercasedMessageContent.startsWith(`<@!${client.user!.id}>`)) {
        prefixLen = client.user!.id.length + (lowercasedMessageContent.startsWith('<@!') ? 4 : 3);
        if (lowercasedMessageContent.charAt(prefixLen) === ' ') prefixLen++;
        msgIsCommand = true;
        log('i', `${message.author.tag} used mention-based prefix for command ${message.content}.`);
    }

    // if it's a command, we handle it.
    if (msgIsCommand) {
        const args: string[] = message.content.slice(prefixLen).split(/ +/g);
        const command = args.shift()!.toLowerCase();

        try {
            await client.commands.run(command, args, message, client);
        } catch (e) {
            log('e', `Executing ${command} for ${message.author.tag} with args ${args} failed:`, true);
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
    log('w', 'Kill client... (exit code ' + code + ')');
    client.destroy(); // Kill the client
    // NOTE: you can't log here
});

// If we get an uncaught exception, close ASAP.
process.on('uncaughtException', async (error) => {
    log('e', 'Killing client...', true);
    client.destroy();
    log('e', 'Client killed.', true);
    log('e', 'An uncaught exception occurred!', true);
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
