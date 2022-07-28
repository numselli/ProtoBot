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

type ReversedData = (string[] | undefined)[];

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
    public reversed: Enmap<'uwus' | 'owos' | 'tildes', ReversedData>;

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

    public ensure(id: string) {
        this.uwus.ensure(id, 0);
        this.owos.ensure(id, 0);
        this.tildes.ensure(id, 0);
        const uwuRevOld = this.reversedUwus();
        if (this.uwus.get(id) === 0 && !uwuRevOld[0]?.includes?.(id)) uwuRevOld[0]?.push(id);
        const owoRevOld = this.reversedOwos();
        if (this.owos.get(id) === 0 && !owoRevOld[0]?.includes?.(id)) owoRevOld[0]?.push(id);
        const tildeRevOld = this.reversedTildes();
        if (this.tildes.get(id) === 0 && !tildeRevOld[0]?.includes?.(id)) tildeRevOld[0]?.push(id);
    }

    public rebuildReversed() {
        this._log.info('Verifying reversed list...');
        this._checkReverse('uwus', this.uwusArray(), this.reversedUwus());
        this._checkReverse('owos', this.owosArray(), this.reversedOwos());
        this._checkReverse('tildes', this.tildesArray(), this.reversedTildes());
        this._log.info('ECTManager: Reversed list rebuilt.');
    }

    private _checkReverse(db: 'uwus' | 'owos' | 'tildes', std: [string, number][], rev: ReversedData) {
        let isOk = true;
        for (const [id, count] of std) {
            if (!rev[count]) {
                this._log.error(`ECTManager: ${db} list is missing entry for count ${count}`);
                isOk = false;
                continue;
            }
            if (!rev[count]!.includes(id)) this._log.error(`ECTManager: ${db} list for entry ${count} is missing id ${id}`);
        }
        if (isOk) this._log.info(`ECTManager: ${db} list is ok`);
        else {
            this._log.error(`ECTManager: ${db} list is not ok... rebuilding.`);
            this._rebuildReverse(db);
        }
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
        return this.tildes.ensure(id, 0);
    }

    private _add(db: 'uwus' | 'owos' | 'tildes', id: string) {
        // We would use .inc() but we need to move the ID around.
        const old = this[db].ensure(id, 0);
        const newArr = this.reversed.get(db)!;
        const revEnt = newArr[old]!;
        if (!revEnt) {
            this._log.error(`ECTManager: ${db} list is missing entry for count ${old}. rebuilding.`);
            this.rebuildReversed();
        }
        // Generate a new entry excluding this one
        let newRevEnt: string[] | undefined = revEnt.filter((i) => i !== id);
        // Set it as sparse if needed
        if (newRevEnt.length === 0) newRevEnt = undefined;
        // Enter in the new rev entry
        newArr[old] = newRevEnt;
        // Add the next as well
        if (!newArr[old + 1]) newArr[old + 1] = [];
        newArr[old + 1]!.push(id);
        this.reversed.set(db, newArr);
        this[db].set(id, old + 1);
    }

    public addUwu(id: string) {
        this._add('uwus', id);
    }

    public addOwo(id: string) {
        this._add('owos', id);
    }

    public addTilde(id: string) {
        this._add('tildes', id);
    }

    public add(id: string, name: 'uwus' | 'owos' | 'tildes') {
        switch (name) {
            case 'uwus':
                this.addUwu(id);
                break;
            case 'owos':
                this.addOwo(id);
                break;
            case 'tildes':
                this.addTilde(id);
                break;
            default:
                throw new Error('This should never happen');
        }
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

    public reversedUwus(): ReversedData {
        return this.reversed.get('uwus')!;
    }

    public reversedOwos(): ReversedData {
        return this.reversed.get('owos')!;
    }

    public reversedTildes(): ReversedData {
        return this.reversed.get('tildes')!;
    }
}
