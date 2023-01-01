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

import type { User } from 'discord.js';

import type LexiClient from '#lib/structures/LexiClient';

export function formatRow(type: 'uwus' | 'owos' | 'tildes', index: number, user: User | null, client: LexiClient): string {
    const ranking = (index + 1).toString().padStart(2, ' ');
    const count = user ? client.emoteCounterTrackers.forUser(user?.id)[type] : 0;
    return `${ranking} :: ${user ? `${user.tag} with ${count} ${type}` : '(none)'}`;
}
