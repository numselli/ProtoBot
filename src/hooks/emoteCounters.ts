/*
 * ProtoBot -- A Discord bot for furries and non-furs alike!
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

import Cooldowns from '@lib/interfaces/db/Cooldowns';
import type Logger from '@lib/interfaces/Logger';
import Hook, { HookConfig } from '@lib/structures/Hook';
import { doesHavePrefix } from '@lib/utils/doesHavePrefix';
import type { Client, Message } from 'discord.js';

function checkAndSet(
    client: Client,
    cooldowns: Cooldowns,
    l: Logger,
    m: Message,
    checkString: 'uwu' | 'owo' | '~',
    dbName: 'uwus' | 'owos' | 'tildes'
): void {
    if (
        ((checkString !== '~' && m.content.toLowerCase().includes(checkString)) ||
            (m.content.endsWith('~') && !/~~+/.test(m.content) && m.content !== '~')) &&
        !doesHavePrefix(m, client) &&
        (!cooldowns || cooldowns[dbName] + client.config.cooldowns[dbName] - Date.now() < 1)
    ) {
        client.emoteCounterTrackers.ensure(m.author.id, client.defaults.EMOTE_TRACKER_COUNTERS);
        client.emoteCounterTrackers.inc(m.author.id, dbName);
        client.cooldowns.set(m.author.id, Date.now(), dbName);
        l('i', `${dbName}: added ${checkString} for ${m.author.tag}.`);
    }
}

export default class EmoteCountersHook extends Hook {
    public getConfig(): HookConfig {
        return {
            name: 'emoteCounters',
            description: 'Detects a message containing "owo", "uwu", or ends in "~" and logs it.'
        };
    }

    public run(message: Message): void {
        const { log, client } = this;
        const cooldowns = client.cooldowns.ensure(message.author.id, client.defaults.COOLDOWNS);
        checkAndSet(client, cooldowns, log, message, 'uwu', 'uwus');
        checkAndSet(client, cooldowns, log, message, 'owo', 'owos');
        checkAndSet(client, cooldowns, log, message, '~', 'tildes');
    }
}
