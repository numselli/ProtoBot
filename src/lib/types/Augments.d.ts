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

/******************************************************************************
 * Hello kind stranger!                                                       *
 * This code was written as a key part of the TypeScript rewrite of ProtoBot. *
 * This makes barely any sense to me, but seems to be the best way to do it.  *
 * This file is critical. DO NOT DELETE IT!     - ProtoBot Maintainer, 0xLogN *
 ******************************************************************************/

// Imports
import Command from '@lib/interfaces/Command';
import CommandConfig from '@lib/interfaces/CommandConfig';
import Config from '@lib/interfaces/Config';
import Cooldowns from '@lib/interfaces/Cooldowns';
import Enmap from 'enmap';
import Fursona from '@lib/interfaces/Fursona';
import MarkovData from '@lib/interfaces/MarkovData';
import Hook from '@lib/interfaces/Hook';
import UserConfig from '@lib/interfaces/UserConfig';
import UserStats from '@lib/interfaces/UserStats';
import CommandHandler from '@lib/CommandHandler';
import PublicConfig from '@lib/interfaces/PublicConfig';

// Discord.js
declare module 'discord.js' {
    interface Client {
        config: Config;
        publicConfig: PublicConfig;
        defaults: {
            USER_CONFIGURATION: UserConfig;
            USER_STATISTICS: UserStats;
            COOLDOWNS: { owos: number; uwus: number; tildes: number };
        };
        cooldowns: Enmap<string, Cooldowns>;
        tildes: Enmap<string, number>;
        owos: Enmap<string, number>;
        uwus: Enmap<string, number>;
        userStatistics: Enmap<string, UserStats>;
        userConfiguration: Enmap<string, UserConfig>;
        markovMessages: Enmap<string, MarkovData>; // NOTE: remove markovs in the future perhaps?
        fursonas: Enmap<string, Fursona>;
        restartData: Enmap<string, unknown>;

        // In memory
        commands: CommandHandler;
        hooks: Enmap<string, Hook>;
    }
}
