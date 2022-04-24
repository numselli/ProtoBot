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

import { highlight } from 'cli-highlight';
import * as colorette from 'colorette';

import log from '#root/log';

/**
 * Called on every query to the Enmap internal database.
 * @param query The SQL query ran
 */
export default function EnmapVerbose(dbName: string, query: string): void {
    log.verbose(
        `${colorette.blue(`[${colorette.bold('DatabaseQuery')}]`)} ${colorette.underline('Query')} ${colorette.red(dbName)}: ${highlight(query, {
            language: 'sql'
        })}`
    );
}
