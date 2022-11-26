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

import type { Message } from 'discord.js';

import type Cooldowns from '#lib/interfaces/db/Cooldowns';
import type LexiLogger from '#lib/interfaces/LexiLogger';
import type LexiClient from '#lib/structures/LexiClient';
import type { LexiHookConfig } from '#lib/structures/LexiHook';
import LexiHook from '#lib/structures/LexiHook';

type Checkers = 'uwu' | 'owo' | '~';
type DBName = 'uwus' | 'owos' | 'tildes';

function checkAndSet(client: LexiClient, cooldowns: Cooldowns, l: LexiLogger, m: Message, checkString: Checkers, dbName: DBName): void {
    if (
        ((checkString !== '~' && m.content.toLowerCase().includes(checkString)) ||
            (m.content.endsWith('~') && !/~~+/.test(m.content) && m.content !== '~')) &&
        (!cooldowns || cooldowns[dbName] + client.config.cooldowns[dbName] - Date.now() < 1)
    ) {
        client.emoteCounterTrackers.ensure(m.author.id);
        client.emoteCounterTrackers.add(m.author.id, dbName);
        client.cooldowns.set(m.author.id, Date.now(), dbName);
        l.info(`${dbName}: added ${checkString} for ${m.author.tag}.`);
    }
}

export default class EmoteCountersHook extends LexiHook {
    public getConfig(): LexiHookConfig {
        return {
            name: 'emoteCounters',
            description: 'Detects a message containing "owo", "uwu", or ends in "~" and logs it.'
        };
    }

    public async run(message: Message): Promise<void> {
        const { log, client } = this;
        const cooldowns = client.cooldowns.ensure(message.author.id, client.defaults.COOLDOWNS);
        checkAndSet(client, cooldowns, log, message, 'uwu', 'uwus');
        checkAndSet(client, cooldowns, log, message, 'owo', 'owos');
        checkAndSet(client, cooldowns, log, message, '~', 'tildes');
    }
}
