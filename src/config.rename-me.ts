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

// Config types
import type LexiConfig from '#lib/interfaces/LexiConfig';

// Ms conversion functions
function seconds(count: number): number {
    return 1000 * count;
}
function minutes(count: number): number {
    return seconds(60) * count;
}

const config: LexiConfig = {
    token: 'PBCONF-DiscordBotToken', // Discord token
    dirs: { commands: './commands/', hooks: './hooks/' },
    cooldowns: { tildes: minutes(1), owos: seconds(30), uwus: seconds(30) },
    adminIDs: [],
    // WARNING: These users can do whatever they want with your system.
    // They have the same power to run code as 'owners'. Be careful!
    superAdminIDs: [],
    ownerID: 'PBCONF-DiscordUserID', // Your user ID

    doDevGuildCommandsIn: false,
    apiPort: 8082,
    hasteServer: 'https://paste.0xlogn.dev',
    repoURL: 'https://github.com/thetayloredman/Lexi'
};

// Export
export default config;
