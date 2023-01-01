/*
 * Lexi -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022, 2023  0xLogN
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

import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';

/**
 * Any slash command builder that has a valid toJSON method.
 *
 * Why does this exist? There is a reason. When adding subcommands, the type changes, and I have no idea how to
 * actually represent this type, so it's an interface.
 */
export default interface JSONAbleSlashCommandBody {
    toJSON: () => RESTPostAPIApplicationCommandsJSONBody;
}
