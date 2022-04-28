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

import type { ClientOptions } from 'discord.js';
import { Client as BaseClient } from 'discord.js';
import Enmap from 'enmap';

import EnmapVerbose from '#lib/EnmapVerbose';
import type Cooldowns from '#lib/interfaces/db/Cooldowns';
import type EmoteCounterData from '#lib/interfaces/db/EmoteCounterData';
import type Fursona from '#lib/interfaces/db/Fursona';
import type GuildData from '#lib/interfaces/db/GuildData';
import type UserConfig from '#lib/interfaces/db/UserConfig';
import type UserStats from '#lib/interfaces/db/UserStats';
import type LexiConfig from '#lib/interfaces/LexiConfig';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiPublicConfig from '#lib/interfaces/LexiPublicConfig';
import LexiCommandHandler from '#lib/LexiCommandHandler';
import type LexiHook from '#lib/structures/LexiHook';
import config from '#root/config';
import publicConfig from '#root/publicConfig';

function makeVerboseFunction(name: string): (_q: string) => void {
    return (q: string) => EnmapVerbose(name, q);
}

export default class LexiClient extends BaseClient {
    private _isAlreadyDestroyed: boolean;
    private _log: LexiLogger;

    public config: LexiConfig;
    public publicConfig: LexiPublicConfig;
    public defaults: {
        USER_CONFIGURATION: UserConfig;
        USER_STATISTICS: UserStats;
        COOLDOWNS: Cooldowns;
        EMOTE_TRACKER_COUNTERS: EmoteCounterData;
        GUILD_DATA: GuildData;
    };

    public cooldowns: Enmap<string, Cooldowns>;
    public emoteCounterTrackers: Enmap<string, EmoteCounterData>;
    public userStatistics: Enmap<string, UserStats>;
    public userConfiguration: Enmap<string, UserConfig>;
    public fursonas: Enmap<string, Fursona>;
    public restartData: Enmap<string, unknown>;
    public guildData: Enmap<string, GuildData>;

    public hooks: Map<string, LexiHook>;
    public commands: LexiCommandHandler;

    public constructor(log: LexiLogger, options: ClientOptions) {
        super(options);
        this._log = log;
        this._isAlreadyDestroyed = false;
        this.config = config;
        this.publicConfig = publicConfig;
        this.defaults = {
            USER_CONFIGURATION: {},
            USER_STATISTICS: { hugs: 0, boops: 0, pats: 0 },
            COOLDOWNS: { owos: false, uwus: false, tildes: false,  },
            EMOTE_TRACKER_COUNTERS: { owos: 0, uwus: 0, tildes: 0 },
            GUILD_DATA: { prefix: config.prefix }
        };
        this.emoteCounterTrackers = new Enmap({ name: 'emoteCounterTrackers', verbose: makeVerboseFunction('emoteCounterTrackers') });
        this.userStatistics = new Enmap({ name: 'userStatistics', verbose: makeVerboseFunction('userStatistics') });
        this.userConfiguration = new Enmap({ name: 'userConfiguration', verbose: makeVerboseFunction('userConfiguration') });
        this.fursonas = new Enmap({ name: 'fursonas', verbose: makeVerboseFunction('fursonas') });
        this.restartData = new Enmap({ name: 'restartData', verbose: makeVerboseFunction('restartData') });
        this.guildData = new Enmap({ name: 'guildData', verbose: makeVerboseFunction('guildData'), autoEnsure: this.defaults.GUILD_DATA });

        // In memory items
        this.hooks = new Map();
        this.cooldowns = new Enmap();

        // Generate the command handling instance.
        this.commands = new LexiCommandHandler(this._log, this.config.dirs.commands, this);
    }

    public destroy(): void {
        if (this._isAlreadyDestroyed) {
            this._log.error('Client destroy: Client is already destroyed. Abort.');
            return;
        }
        this._isAlreadyDestroyed = true;
        super.destroy();
    }
}
