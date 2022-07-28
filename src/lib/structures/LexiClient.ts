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
import type UserConfig from '#lib/interfaces/db/UserConfig';
import type UserStats from '#lib/interfaces/db/UserStats';
import type LexiConfig from '#lib/interfaces/LexiConfig';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiPublicConfig from '#lib/interfaces/LexiPublicConfig';
import LexiCommandHandler from '#lib/LexiCommandHandler';
import type LexiHook from '#lib/structures/LexiHook';
import config from '#root/config';
import publicConfig from '#root/publicConfig';

import LexiECTManager from './LexiECTManager';

/** Make a verbose function for an Enmap. */
export function makeVerboseFunction(name: string): (_q: string) => void {
    return (q: string) => EnmapVerbose(name, q);
}

export default class LexiClient extends BaseClient {
    /** Is this client already destroyed? */
    private _isAlreadyDestroyed: boolean;
    /** See {@link LexiLogger}. */
    private _log: LexiLogger;

    /** See {@link LexiConfig}. */
    public config: LexiConfig;
    /** See {@link LexiPublicConfig} */
    public publicConfig: LexiPublicConfig;
    /** Default settings for Lexi. */
    public defaults: {
        /** See {@link UserConfig}. */
        USER_CONFIGURATION: UserConfig;
        /** See {@link UserStats}. */
        USER_STATISTICS: UserStats;
        /** See {@link Cooldowns}. */
        COOLDOWNS: Cooldowns;
    };

    /** Cooldowns information for ECTs. */
    public cooldowns: Enmap<string, Cooldowns>;
    /** The {@link LexiECTManager} for ECTs. */
    public emoteCounterTrackers: LexiECTManager;
    /** Stores hugs, and similar information. */
    public userStatistics: Enmap<string, UserStats>;
    /** Settings for the users. */
    public userConfiguration: Enmap<string, UserConfig>;
    /** How was the bot restarted last? */
    public restartData: Enmap<string, unknown>;

    /** See {@link LexiHook}. */
    public hooks: Map<string, LexiHook>;
    /** See {@link LexiCommandHandler}. */
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
            COOLDOWNS: { owos: 0, uwus: 0, tildes: 0 }
        };
        this.emoteCounterTrackers = new LexiECTManager(this, this._log);
        this.userStatistics = new Enmap({ name: 'userStatistics', verbose: makeVerboseFunction('userStatistics') });
        this.userConfiguration = new Enmap({ name: 'userConfiguration', verbose: makeVerboseFunction('userConfiguration') });
        this.restartData = new Enmap({ name: 'restartData', verbose: makeVerboseFunction('restartData') });

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
