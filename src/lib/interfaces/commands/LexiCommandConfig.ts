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

import type { Permissions } from '#lib/Permissions';

/**
 * Slash command configuration for Lexi.
 */
export default interface LexiCommandConfig {
    /** The name of this command. LexiCommandHandler automatically sets this in the builder. */
    name: string;
    /** The description of this command. Similar to {@link LexiCommandConfig.name}, it is also autoset. */
    description: string;
    /** If set to false, this command cannot be used by anyone. */
    enabled: boolean;

    /**
     * Restrict takes a few possibilities. It may be a Permissions entry, or an array of
     * user IDs.
     *
     * Permissions is the minimum level to execute.
     */
    restrict: Permissions | string[] | false;
}
