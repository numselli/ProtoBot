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

import * as colorette from 'colorette';
import type { TextChannel } from 'discord.js';
import { Intents } from 'discord.js';

import * as ready from '#lib/onready/index';
import LexiClient from '#lib/structures/LexiClient';
import log from '#root/log';

// Verify the currently running commit...
log.info('Verifying we were started via the start script...');
if (!process.env.LEXI_STARTSH_COMMIT) {
    log.error('Environment variable LEXI_STARTSH_COMMIT is not set!');
    log.error("If you are seeing this message, it means you are running the bot's script directly.");
    log.error('This is not recommended, and may cause unexpected behavior.');
    log.error('After multiple bug reports of people using an invalid environment (like this one),');
    log.error('the developer team has decided that direct execution should be disabled.');
    log.error('Please use the start script instead.');
    log.error('Reference issue #463 for more information.');
    log.error('We were not started via the start script! Exiting (code 1)...');
    process.exit(1);
}

// Initialize a Client instance, and provide the Discord intent flags.
const client = new LexiClient(log, {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES, // We may need to apply for this intent at verification
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
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
    log.verbose(
        `${colorette.yellow(`[${colorette.bold('MSG')}]`)} ${`${colorette.bold(colorette.blue(`@${message.author.tag}`))} ${colorette.green(
            `#${(message.channel as TextChannel).name ?? '<DM>'}`
        )}`}: ${message.content}`
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
        log.info(`Discouraged DM from ${message.author.tag}`);
        message.reply('Hey there! I do not accept DMs. Use me in a server.');
        return;
    }
    // Execute each hook from the database.
    for (const /*  */ hook of client.hooks.array()) {
        const cfg = hook.getConfig();
        log.verbose(`Running hook ${cfg.name} for ${message.author.tag}!`);
        // eslint-disable-next-line no-await-in-loop
        await hook.run(message);
    }
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
        log.verbose(`${message.author.tag} used mention-based prefix for command ${message.content}.`);
    }

    // if it's a command, we handle it.
    if (msgIsCommand) {
        const args: string[] = message.content.slice(prefixLen).split(/ +/g);
        const command = args.shift()!.toLowerCase();

        try {
            await client.commands.run(command, args, message, client);
        } catch (e) {
            log.error(`Executing ${command} for ${message.author.tag} with args ${args} failed:`);
            log.errorWithStack(e);
            message.reply('Something went wrong! Notify a developer.');
        }
    }
});

// Handle rate limits
client.on('rateLimit', (data) => {
    log.warn('Got hit with a ratelimit!');
    log.warn(`Ratelimited when performing ${data.method} ${data.path}`);
    log.warn(`API route was ${data.route} and limit hit was ${data.limit}/${data.timeout}ms (${data.timeout / 1000} seconds).`);
    log.warn('Operations have been paused until the ratelimit is lifted!');
});

// Handle SIGTERM and SIGINT
async function handleInterrupt(): Promise<void> {
    log.warn('Got SIGTERM or SIGINT, shutting down...');
    log.warn('Sync logs...');
    await log.cleanup();
    process.exit();
}
process.on('SIGTERM', handleInterrupt);
process.on('SIGINT', handleInterrupt);

// When the process exits, wrap up.
process.on('exit', (code) => {
    log.warn(`Kill client... (exit code ${code})`);
    client.destroy(); // Kill the client
    // NOTE: you can't log here
});

// If we get an uncaught exception, close ASAP.
process.on('uncaughtException', async (error) => {
    log.error('Killing client...');
    client.destroy();
    log.error('Client killed.');
    log.error('An uncaught exception occurred!');
    log.error(`Error thrown was:`);
    error.stack?.split('\n').forEach((item) => {
        log.error(`${item}`);
    });
    log.error('Stack trace dump:');
    let stack = new Error().stack?.split('\n');
    stack?.shift();
    if (!stack) stack = [];

    stack.forEach((item) => {
        log.error(`${item}`);
    });
    log.error('Process exiting.');
    log.error('Exit code 5.');
    log.errorWithStack('Goodbye!');
    await log.cleanup();
    process.exit(5);
});

// Log in
client.login(client.config.token);
