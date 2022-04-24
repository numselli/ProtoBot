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

/******************************************************************************
 * Hello kind stranger!                                                       *
 * This code was written as a key part of the TypeScript rewrite of Lexi. *
 * This makes barely any sense to me, but seems to be the best way to do it.  *
 * This file is critical. DO NOT DELETE IT!     - Lexi Maintainer, 0xLogN *
 ******************************************************************************/

// Imports
import Enmap from 'enmap';

import Config from '#lib/interfaces/Config';
import Cooldowns from '#lib/interfaces/db/Cooldowns';
import EmoteCounterData from '#lib/interfaces/db/EmoteCounterData';
import Fursona from '#lib/interfaces/db/Fursona';
import GuildData from '#lib/interfaces/db/guildData';
import UserConfig from '#lib/interfaces/db/UserConfig';
import UserStats from '#lib/interfaces/db/UserStats';
import Hook from '#lib/interfaces/Hook';
import MarkovData from '#lib/interfaces/MarkovData';
import PublicConfig from '#lib/interfaces/PublicConfig';
import LexiCommandHandler from '#lib/LexiCommandHandler';

// Discord.js
declare module 'discord.js' {
    interface Client {
        config: Config;
        publicConfig: PublicConfig;
        defaults: {
            USER_CONFIGURATION: UserConfig;
            USER_STATISTICS: UserStats;
            COOLDOWNS: { owos: number; uwus: number; tildes: number };
            EMOTE_TRACKER_COUNTERS: EmoteCounterData;
            GUILD_DATA: GuildData;
        };
        cooldowns: Enmap<string, Cooldowns>;
        emoteCounterTrackers: Enmap<string, EmoteCounterData>;
        userStatistics: Enmap<string, UserStats>;
        userConfiguration: Enmap<string, UserConfig>;
        markovMessages: Enmap<string, MarkovData>; // NOTE: remove markovs in the future perhaps?
        fursonas: Enmap<string, Fursona>;
        restartData: Enmap<string, unknown>;
        guildData: Enmap<string, GuildData>;

        // In memory
        commands: LexiCommandHandler;
        hooks: Enmap<string, Hook>;
    }
}

// FIXME: Until enmap is fixed
declare module 'enmap' {
    export interface EnmapOptions {
        autoEnsure?: unknown;
    }
}
