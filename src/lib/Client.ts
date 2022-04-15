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

import config from '@root/config';
import publicConfig from '@root/publicConfig';
import { Client as BaseClient, ClientOptions } from 'discord.js';
import Enmap from 'enmap';
import EnmapVerbose from '@lib/EnmapVerbose';
import type Logger from '@lib/interfaces/Logger';
import CommandHandler from './CommandHandler';

function makeVerboseFunction(name: string): (_q: string) => void {
    return (q: string) => EnmapVerbose(name, q);
}

export default class Client extends BaseClient {
    private _isAlreadyDestroyed: boolean;
    private _log: Logger;

    public constructor(log: Logger, options: ClientOptions) {
        super(options);
        this._log = log;
        this._isAlreadyDestroyed = false;
        this.config = config;
        this.publicConfig = publicConfig;
        this.defaults = {
            USER_CONFIGURATION: {},
            USER_STATISTICS: { hugs: 0, boops: 0, pats: 0 },
            COOLDOWNS: { owos: 0, uwus: 0, tildes: 0 },
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
        this.hooks = new Enmap();
        this.cooldowns = new Enmap();

        // Generate the command handling instance.
        this.commands = new CommandHandler(this._log, this.config.dirs.commands);
    }

    public destroy(): void {
        if (this._isAlreadyDestroyed) {
            this._log('e', 'Client destroy: Client is already destroyed. Abort.', true);
            return;
        }
        this._isAlreadyDestroyed = true;
        super.destroy();
    }
}
