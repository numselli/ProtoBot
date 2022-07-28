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

import Enmap from 'enmap';

import type LexiLogger from '#lib/interfaces/LexiLogger';

import type LexiClient from './LexiClient';
import { makeVerboseFunction } from './LexiClient';

/**
 * Stores ECT (emote counter/tracker) data for Lexi.
 */
export default class LexiECTManager {
    private _log: LexiLogger;

    /** The client this belongs to. */
    public client: LexiClient;

    /** uwus data */
    public uwus: Enmap<string, number>;
    /** owos data */
    public owos: Enmap<string, number>;
    /** tildes data */
    public tildes: Enmap<string, number>;

    /** reversed version of the above data */
    public reversed: Enmap<'uwus' | 'owos' | 'tildes', string[][]>;

    public constructor(client: LexiClient, log: LexiLogger) {
        this.client = client;
        this._log = log;

        this.uwus = new Enmap({ name: 'ect-uwus', verbose: makeVerboseFunction('ect-uwus') });
        this.owos = new Enmap({ name: 'ect-owos', verbose: makeVerboseFunction('ect-owos') });
        this.tildes = new Enmap({ name: 'ect-tildes', verbose: makeVerboseFunction('ect-tildes') });

        this.reversed = new Enmap({ name: 'ect-reverse', verbose: makeVerboseFunction('ect-reverse') });
        this.reversed.ensure('uwus', []);
        this.reversed.ensure('owos', []);
        this.reversed.ensure('tildes', []);
        log.info('ECTManager initialized. Rebuilding reversed list...');
        this.rebuildReversed();
    }

    public rebuildReversed() {
        this._log.info('Verifying reversed list...');
        const uwus = this.uwusArray();
        const ruwus = this.reversedUwus();
        const owos = this.owosArray();
        const rowos = this.reversedOwos();
        const tildes = this.tildesArray();
        const rtildes = this.reversedTildes();

        // Check uwus set
        let uwusOk = true;
        for (const [id, count] of uwus) {
            if (!ruwus[count]) {
                this._log.error(`ECTManager: uwus list is missing entry for count ${count}`);
                uwusOk = false;
                continue;
            }
            if (!ruwus[count].includes(id)) this._log.error(`ECTManager: uwus list for entry ${count} is missing id ${id}`);
        }
        if (uwusOk) this._log.info('ECTManager: uwus list is ok');
        else {
            this._log.error('ECTManager: uwus list is not ok... rebuilding.');
            this._rebuildReverse('uwus');
        }

        // Check owos set
        let owosOk = true;
        for (const [id, count] of owos) {
            if (!rowos[count]) {
                this._log.error(`ECTManager: owos list is missing entry for count ${count}`);
                owosOk = false;
                continue;
            }
            if (!rowos[count].includes(id)) this._log.error(`ECTManager: owos list for entry ${count} is missing id ${id}`);
        }
        if (owosOk) this._log.info('ECTManager: owos list is ok');
        else {
            this._log.error('ECTManager: owos list is not ok... rebuilding.');
            this._rebuildReverse('owos');
        }

        // Check tildes set
        let tildesOk = true;
        for (const [id, count] of tildes) {
            if (!rtildes[count]) {
                this._log.error(`ECTManager: tildes list is missing entry for count ${count}`);
                tildesOk = false;
                continue;
            }
            if (!rtildes[count].includes(id)) this._log.error(`ECTManager: tildes list for entry ${count} is missing id ${id}`);
        }
        if (tildesOk) this._log.info('ECTManager: tildes list is ok');
        else {
            this._log.error('ECTManager: tildes list is not ok... rebuilding.');
            this._rebuildReverse('tildes');
        }

        this._log.info('ECTManager: Reversed list rebuilt.');
    }

    private _rebuildReverse(db: 'uwus' | 'owos' | 'tildes') {
        const newArr: (string | never)[][] = [];
        for (const [id, count] of this[db]) {
            if (!newArr[count]) newArr[count] = [];
            newArr[count].push(id);
        }
        this.reversed.set(db, newArr);
    }

    public forUser(id: string) {
        return {
            uwus: this.uwusForUser(id),
            owos: this.owosForUser(id),
            tildes: this.tildesForUser(id)
        };
    }

    public uwusForUser(id: string) {
        return this.uwus.ensure(id, 0);
    }

    public owosForUser(id: string) {
        return this.owos.ensure(id, 0);
    }

    public tildesForUser(id: string) {
        this.tildes.ensure(id, 0);
    }

    public addUwu(id: string) {
        this.uwus.inc(id);
    }

    public addOwo(id: string) {
        this.owos.inc(id);
    }

    public addTilde(id: string) {
        this.tildes.inc(id);
    }

    public uwusArray() {
        return Array.from(this.uwus.entries());
    }

    public owosArray() {
        return Array.from(this.owos.entries());
    }

    public tildesArray() {
        return Array.from(this.tildes.entries());
    }

    public reversedUwus() {
        return this.reversed.get('uwus')!;
    }

    public reversedOwos() {
        return this.reversed.get('owos')!;
    }

    public reversedTildes() {
        return this.reversed.get('tildes')!;
    }
}
