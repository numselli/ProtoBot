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

import config from '@root/config';
import { Client as BaseClient, ClientOptions } from 'discord.js';
import Enmap from 'enmap';
import EnmapVerbose from '@lib/EnmapVerbose';
import type Logger from '@lib/interfaces/Logger';

function makeVerboseFunction(name: string): (q: string) => void {
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
        this.defaults = {
            USER_CONFS: {},
            USER_STATS: { hugs: 0, boops: 0, pats: 0 },
            COOLDOWNS: { owos: 0, uwus: 0, tildes: 0 }
        };
        this.cooldowns = new Enmap({ name: 'cooldowns', verbose: makeVerboseFunction('cooldowns') });
        this.tildes = new Enmap({ name: 'tildes', verbose: makeVerboseFunction('tildes') });
        this.owos = new Enmap({ name: 'owos', verbose: makeVerboseFunction('owos') });
        this.uwus = new Enmap({ name: 'uwus', verbose: makeVerboseFunction('uwus') });
        this.ustats = new Enmap({ name: 'ustats', verbose: makeVerboseFunction('ustats') });
        this.uconfs = new Enmap({ name: 'uconfs', verbose: makeVerboseFunction('uconfs') });
        this.fursonas = new Enmap({ name: 'fursonas', verbose: makeVerboseFunction('fursonas') });
        this.restartData = new Enmap({ name: 'restartData', verbose: makeVerboseFunction('restartData') });

        // In memory items
        this.commands = new Enmap();
        this.commandsConfig = new Enmap();
        this.commandsRefs = new Enmap(); // Refs are basically aliases that "link" to the actual command
        this.hooks = new Enmap();
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
