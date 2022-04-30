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

import type Cooldowns from '#lib/interfaces/db/Cooldowns';

/** A relative path ending in /. */
type RelativeDirname = `./${string}/`;

/** Lexi bot configuration. */
export default interface LexiConfig {
    /** The Discord API token to log in as. */
    token: string;
    /** Directories where stuff is stored. */
    dirs: { commands: RelativeDirname; hooks: RelativeDirname };
    /** See {@link Cooldowns}. */
    cooldowns: { [key in keyof Cooldowns]: number /* (ms) */ };
    /** Administators. See {@link Permissions}. */
    adminIDs: string[];
    /** These people can use /admin eval. This is dangerous to grant. See {@link Permissions} */
    superAdminIDs: string[];
    /** The one and only owner. */
    ownerID: string;

    /** If set to false, use normal commands. Set to a guild ID and it will recieve un-cached commands prefixed with /dev-. */
    doDevGuildCommandsIn: false | string;
}
