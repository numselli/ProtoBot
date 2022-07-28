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

import type LexiClient from './LexiClient';
import { makeVerboseFunction } from './LexiClient';

/**
 * Stores ECT (emote counter/tracker) data for Lexi.
 */
export default class LexiECTManager {
    /** The client this belongs to. */
    public client: LexiClient;

    /** uwus data */
    public uwus: Enmap<string, number>;
    /** owos data */
    public owos: Enmap<string, number>;
    /** tildes data */
    public tildes: Enmap<string, number>;

    public constructor(client: LexiClient) {
        this.client = client;

        this.uwus = new Enmap({ name: 'ect-uwus', verbose: makeVerboseFunction('ect-uwus') });
        this.owos = new Enmap({ name: 'ect-owos', verbose: makeVerboseFunction('ect-owos') });
        this.tildes = new Enmap({ name: 'ect-tildes', verbose: makeVerboseFunction('ect-tildes') });
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

    public addUwu(id: string) {
        return this.uwus.inc(id);
    }

    public addOwo(id: string) {
        return this.owos.inc(id);
    }

    public addTilde(id: string) {
        return this.tildes.inc(id);
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
}
