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

export enum Permissions {
    /** Nothing special. This person is just a number. */
    NONE,

    /** MANAGE_MESSAGES in the channel. */
    CHANNEL_MODERATOR,

    /** BAN_MEMBERS in the guild. */
    SERVER_MODERATOR,

    /** ADMINISTRATOR in the guild. */
    SERVER_ADMINISTRATOR,

    /** Guild owner. */
    SERVER_OWNER,

    /** In the config.adminIDs list. */
    BOT_ADMINISTRATOR,

    /** In the config.superAdminIDs list. */
    BOT_SUPER_ADMIN,

    /** The one and only config.ownerID. */
    BOT_OWNER
}
